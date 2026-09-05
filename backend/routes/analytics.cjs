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

module.exports = router;
