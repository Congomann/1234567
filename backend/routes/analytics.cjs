/**
 * analytics.cjs
 * 
 * Express Router for Behavioral Tracking & Session Analytics API (Milestone M1)
 * 
 * Mounted Endpoints:
 * - POST /api/analytics/track
 * - GET  /api/analytics/sessions/query
 * - GET  /api/analytics/profiles/:identifier
 * - GET  /api/admin/analytics/tracked-entities
 */

const express = require('express');
const router = express.Router();
const { behavioralTrackingService } = require('../services/behavioralTrackingService.cjs');

/**
 * Helper to extract client IP address accurately across proxies and local sockets.
 */
function extractClientIp(req) {
  try {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
    if (forwarded) {
      const ips = forwarded.split(',');
      return ips[0].trim();
    }
    if (req.socket && req.socket.remoteAddress) {
      return req.socket.remoteAddress;
    }
    if (req.ip) {
      return req.ip;
    }
  } catch (e) {
    // Gracefully handle unattached mock sockets
  }
  return '127.0.0.1';
}

// ════════════════════════════════════════════════════════════════════════════════
// TRACKING INGESTION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/analytics/track
 * Ingests a page visit / interaction, enforcing the 15-minute sliding inactivity window.
 */
router.post('/analytics/track', async (req, res) => {
  try {
    const {
      visitorId,
      sessionId,
      ip,
      url,
      path,
      title,
      referrer,
      metadata = {},
      leadInfo = null,
      timestamp = null
    } = req.body || {};

    const clientIp = ip || extractClientIp(req);
    const userAgent = req.headers['user-agent'] || metadata.userAgent || '';

    const trackingResult = await behavioralTrackingService.recordVisit({
      visitorId,
      sessionId,
      ip: clientIp,
      url,
      path: path || '/',
      title: title || '',
      referrer: referrer || req.headers['referer'] || '',
      metadata: {
        ...metadata,
        userAgent
      },
      leadInfo,
      timestamp
    });

    return res.status(200).json(trackingResult);
  } catch (error) {
    console.error('[Analytics API] Error recording visit:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error recording tracking visit'
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// SESSION QUERYING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/analytics/sessions/query
 * Query sessions by IP, user (email/phone/id), visitorId, or leadId.
 */
router.get('/analytics/sessions/query', async (req, res) => {
  try {
    const { ip, user, visitorId, leadId, limit } = req.query;

    const queryResult = await behavioralTrackingService.querySessions({
      ip,
      user,
      visitorId,
      leadId,
      limit: limit ? parseInt(limit, 10) : 50
    });

    return res.status(200).json({
      success: true,
      ...queryResult
    });
  } catch (error) {
    console.error('[Analytics API] Error querying sessions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error querying sessions'
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL PROFILE & AD RECOMMENDATIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/analytics/profiles/:identifier
 * Fetch aggregated behavioral profile, category affinity, and targeted ads by IP, visitorId, or leadId/email.
 */
router.get('/analytics/profiles/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Identifier parameter is required' });
    }

    const profileData = await behavioralTrackingService.getProfile(identifier);
    if (!profileData) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    return res.status(200).json({
      success: true,
      ...profileData
    });
  } catch (error) {
    console.error('[Analytics API] Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error fetching behavioral profile'
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN TRACKED ENTITIES SELECTOR
// ════════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/analytics/tracked-entities
 * (also aliased to /api/analytics/tracked-entities for convenience)
 * Populates admin inspector selector with tracked IPs, visitors, and converted leads.
 */
const getTrackedEntitiesHandler = async (req, res) => {
  try {
    const entities = await behavioralTrackingService.getAllTrackedEntities();
    return res.status(200).json({
      success: true,
      entities
    });
  } catch (error) {
    console.error('[Analytics API] Error fetching tracked entities:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error fetching tracked entities'
    });
  }
};

router.get('/admin/analytics/tracked-entities', getTrackedEntitiesHandler);
router.get('/analytics/tracked-entities', getTrackedEntitiesHandler);

// ════════════════════════════════════════════════════════════════════════════════
// ATTRIBUTION DASHBOARD
// ════════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/analytics/attribution
 * Fetches Leads, Qualified, Appointments, and estimated CPL grouped by source.
 */
router.get('/analytics/attribution', async (req, res) => {
  try {
    const { supabase } = require('../supabase.cjs');
    
    // 1. Fetch real spend data from marketing_campaigns
    const { data: campaigns, error: campErr } = await supabase
      .from('marketing_campaigns')
      .select('type, spend');
    if (campErr) throw campErr;

    const spendBySource = {};
    if (campaigns) {
      campaigns.forEach(c => {
        // Map campaign type to lead source if necessary, or just use as-is
        let sourceName = c.type;
        if (sourceName === 'LinkedIn') sourceName = 'LinkedIn Ads'; // match lead source names
        if (!spendBySource[sourceName]) spendBySource[sourceName] = 0;
        spendBySource[sourceName] += parseFloat(c.spend || 0);
      });
    }

    // 2. Fetch leads data
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('source, qualification, status');
    if (leadsErr) throw leadsErr;

    const agg = {};
    if (leads) {
      leads.forEach(l => {
        const src = l.source || 'Organic';
        if (!agg[src]) agg[src] = { leads: 0, qualified: 0, appointments: 0, spend: 0 };
        agg[src].leads++;
        if (l.qualification === 'Hot' || l.qualification === 'Warm') agg[src].qualified++;
        if (l.status === 'Appointment Set') agg[src].appointments++;
      });
    }

    // 3. Merge spend and compute CPL
    const allSources = new Set([...Object.keys(agg), ...Object.keys(spendBySource)]);
    const formatted = Array.from(allSources).map(src => {
      const metrics = agg[src] || { leads: 0, qualified: 0, appointments: 0 };
      const spend = spendBySource[src] || 0;
      const cpl = metrics.leads > 0 ? (spend / metrics.leads).toFixed(2) : 0;
      
      return {
        source: src,
        leads: metrics.leads,
        qualified: metrics.qualified,
        appointments: metrics.appointments,
        spend,
        cpl: parseFloat(cpl)
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('[Analytics API] Error fetching attribution:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
