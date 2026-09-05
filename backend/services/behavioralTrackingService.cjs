/**
 * behavioralTrackingService.cjs
 * 
 * Enterprise Behavioral Tracking & Firestore Session Management Engine (Milestone M1)
 * 
 * Features:
 * - 15-minute sliding inactivity window sessionization (900,000 ms).
 * - Cryptographic session ID generation (sess_${timestamp}_${hex}).
 * - Dual-layer Firestore storage adapter with full in-memory document emulator for demo mode.
 * - Firestore collections: 'sessions' and 'behavioral_profiles'.
 * - CRM lead identity resolution (linking sessions by leadId, email, phone, IP, or visitorId).
 * - Behavioral profiling: 0-100 intent scoring, multi-category affinity, marketing tags, and targeted ad recommendations.
 */

const crypto = require('crypto');

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════
const SESSION_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes (900,000 ms)
const MAX_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;   // 8 hours safety cap

const CATEGORY_KEYWORDS = {
  'life-insurance': ['life', 'insurance', 'term', 'whole-life', 'universal', 'beneficiary', 'death-benefit', 'coverage', 'policy'],
  'real-estate': ['real-estate', 'property', 'mortgage', 'commercial', 'reit', 'housing', 'home-loan', 'equity', 'land'],
  'securities': ['securities', 'stock', 'wealth', 'invest', 'portfolio', 'bond', 'fund', 'trading', 'asset-allocation'],
  'annuities': ['annuity', 'annuities', 'guaranteed-income', 'retirement', 'pension', 'fixed-index'],
  'mortgage': ['mortgage', 'refinance', 'loan-rate', 'amortization', 'lending', 'pre-approval']
};

const HIGH_INTENT_KEYWORDS = [
  'quote', 'apply', 'calculator', 'pricing', 'schedule', 'enroll', 'consultation', 'checkout', 'contact'
];

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY FIRESTORE EMULATOR / STORE
// ════════════════════════════════════════════════════════════════════════════════

class DocumentSnapshot {
  constructor(id, data) {
    this.id = id;
    this._data = data ? JSON.parse(JSON.stringify(data)) : null;
    this.exists = data !== null && data !== undefined;
  }

  data() {
    return this._data ? JSON.parse(JSON.stringify(this._data)) : undefined;
  }
}

class QuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }

  forEach(callback) {
    this.docs.forEach(callback);
  }
}

class MockQuery {
  constructor(collectionRef, filters = [], orderBys = [], limitCount = null) {
    this.collectionRef = collectionRef;
    this.filters = filters;
    this.orderBys = orderBys;
    this.limitCount = limitCount;
  }

  where(field, op, value) {
    return new MockQuery(
      this.collectionRef,
      [...this.filters, { field, op, value }],
      [...this.orderBys],
      this.limitCount
    );
  }

  orderBy(field, direction = 'asc') {
    return new MockQuery(
      this.collectionRef,
      [...this.filters],
      [...this.orderBys, { field, direction }],
      this.limitCount
    );
  }

  limit(count) {
    return new MockQuery(
      this.collectionRef,
      [...this.filters],
      [...this.orderBys],
      count
    );
  }

  async get() {
    let docs = Array.from(this.collectionRef.store.values());

    for (const filter of this.filters) {
      docs = docs.filter(doc => {
        const val = doc[filter.field];
        switch (filter.op) {
          case '==': return val === filter.value;
          case '!=': return val !== filter.value;
          case '>': return val > filter.value;
          case '>=': return val >= filter.value;
          case '<': return val < filter.value;
          case '<=': return val <= filter.value;
          case 'array-contains': return Array.isArray(val) && val.includes(filter.value);
          case 'in': return Array.isArray(filter.value) && filter.value.includes(val);
          default: return true;
        }
      });
    }

    for (const ob of this.orderBys) {
      docs.sort((a, b) => {
        const aVal = a[ob.field];
        const bVal = b[ob.field];
        if (aVal < bVal) return ob.direction === 'desc' ? 1 : -1;
        if (aVal > bVal) return ob.direction === 'desc' ? -1 : 1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      docs = docs.slice(0, this.limitCount);
    }

    return new QuerySnapshot(docs.map(d => new DocumentSnapshot(d.id, d)));
  }
}

class DocumentReference {
  constructor(collectionRef, id) {
    this.collectionRef = collectionRef;
    this.id = id;
  }

  async get() {
    const data = this.collectionRef.store.get(this.id);
    return new DocumentSnapshot(this.id, data);
  }

  async set(data, options = {}) {
    if (options.merge) {
      const existing = this.collectionRef.store.get(this.id) || {};
      const merged = { ...existing, ...data, id: this.id };
      this.collectionRef.store.set(this.id, merged);
      return merged;
    } else {
      const saved = { ...data, id: this.id };
      this.collectionRef.store.set(this.id, saved);
      return saved;
    }
  }

  async update(data) {
    const existing = this.collectionRef.store.get(this.id);
    if (!existing) {
      throw new Error(`Document ${this.id} does not exist in collection ${this.collectionRef.name}`);
    }
    const updated = { ...existing, ...data };
    this.collectionRef.store.set(this.id, updated);
    return updated;
  }

  async delete() {
    this.collectionRef.store.delete(this.id);
  }
}

class CollectionReference {
  constructor(name) {
    this.name = name;
    this.store = new Map(); // id -> docData
  }

  doc(id) {
    const docId = id || crypto.randomUUID();
    return new DocumentReference(this, docId);
  }

  where(field, op, value) {
    return new MockQuery(this, [{ field, op, value }]);
  }

  orderBy(field, direction) {
    return new MockQuery(this, [], [{ field, direction }]);
  }

  limit(count) {
    return new MockQuery(this, [], [], count);
  }

  async get() {
    return new MockQuery(this).get();
  }

  async add(data) {
    const id = crypto.randomUUID();
    const docRef = this.doc(id);
    await docRef.set(data);
    return docRef;
  }
}

class InMemoryFirestoreStore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new CollectionReference(name));
    }
    return this.collections.get(name);
  }

  clear() {
    this.collections.clear();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL TRACKING SERVICE
// ════════════════════════════════════════════════════════════════════════════════

class BehavioralTrackingService {
  constructor(options = {}) {
    this.inactivityTimeoutMs = options.inactivityTimeoutMs || SESSION_INACTIVITY_TIMEOUT_MS;
    this.pool = options.pool || null;
    
    // Attempt Firestore client initialization if credentials present; fallback to in-memory store
    this.firestore = this._initializeFirestore();
    
    // In-memory CRM Lead resolution cache (maps visitorId/email/phone/ip -> lead)
    this.leadIndex = {
      byVisitor: new Map(),
      byEmail: new Map(),
      byPhone: new Map(),
      byIp: new Map(),
      byId: new Map()
    };
  }

  _initializeFirestore() {
    if (process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const { Firestore } = require('@google-cloud/firestore');
        console.log('[BehavioralTrackingService] Initialized live Google Cloud Firestore client.');
        return new Firestore();
      } catch (err) {
        console.warn('[BehavioralTrackingService] @google-cloud/firestore not available, falling back to in-memory emulator:', err.message);
      }
    }
    return new InMemoryFirestoreStore();
  }

  getFirestore() {
    return this.firestore;
  }

  /**
   * Generates a cryptographically strong session ID: sess_${timestamp}_${hex}
   */
  generateSessionId(timestamp = Date.now()) {
    const hex = crypto.randomBytes(6).toString('hex');
    return `sess_${timestamp}_${hex}`;
  }

  /**
   * Resets all tracking state (used in testing)
   */
  reset() {
    if (typeof this.firestore.clear === 'function') {
      this.firestore.clear();
    }
    this.leadIndex = {
      byVisitor: new Map(),
      byEmail: new Map(),
      byPhone: new Map(),
      byIp: new Map(),
      byId: new Map()
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FIRESTORE STORE ACCESSORS FOR SESSIONS & PROFILES
  // ────────────────────────────────────────────────────────────────────────────

  async saveSession(session) {
    const docRef = this.firestore.collection('sessions').doc(session.id);
    await docRef.set(session, { merge: true });
    return session;
  }

  async getSession(sessionId) {
    if (!sessionId) return null;
    const snap = await this.firestore.collection('sessions').doc(sessionId).get();
    return snap.exists ? snap.data() : null;
  }

  async finalizeSession(sessionId, endedAt) {
    const session = await this.getSession(sessionId);
    if (!session) return;
    const finalEnd = endedAt || new Date().toISOString();
    const startedMs = new Date(session.started_at).getTime();
    const endedMs = new Date(finalEnd).getTime();
    const duration = Math.max(0, Math.round((endedMs - startedMs) / 1000));

    session.is_active = false;
    session.ended_at = finalEnd;
    session.duration_seconds = duration;

    await this.saveSession(session);
  }

  async getLatestActiveSession(visitorId) {
    if (!visitorId) return null;
    const sessionsCol = this.firestore.collection('sessions');
    const snapshot = await sessionsCol.where('visitor_id', '==', visitorId).get();
    
    let latest = null;
    snapshot.forEach(doc => {
      const s = doc.data();
      if (s.is_active) {
        if (!latest || new Date(s.last_activity_at).getTime() > new Date(latest.last_activity_at).getTime()) {
          latest = s;
        }
      }
    });
    return latest;
  }

  async saveProfile(profile) {
    const docRef = this.firestore.collection('behavioral_profiles').doc(profile.id);
    await docRef.set(profile, { merge: true });
    return profile;
  }

  async getRawProfile(profileId) {
    if (!profileId) return null;
    const snap = await this.firestore.collection('behavioral_profiles').doc(profileId).get();
    return snap.exists ? snap.data() : null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // IDENTITY RESOLUTION & LEAD LINKING
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Registers or resolves a CRM lead across multiple identifiers (leadId, email, phone, IP, visitorId).
   */
  async resolveLead(leadInfo = {}, visitorId = null, ip = null) {
    const info = leadInfo || {};
    let lead = null;

    const email = info.email ? info.email.trim().toLowerCase() : null;
    const phone = info.phone ? info.phone.trim() : null;
    const leadId = info.leadId || info.id || null;
    const name = info.name || info.fullName || info.full_name || null;

    // 1. Check in-memory index
    if (leadId && this.leadIndex.byId.has(leadId)) {
      lead = this.leadIndex.byId.get(leadId);
    } else if (email && this.leadIndex.byEmail.has(email)) {
      lead = this.leadIndex.byEmail.get(email);
    } else if (phone && this.leadIndex.byPhone.has(phone)) {
      lead = this.leadIndex.byPhone.get(phone);
    } else if (visitorId && this.leadIndex.byVisitor.has(visitorId)) {
      lead = this.leadIndex.byVisitor.get(visitorId);
    } else if (ip && this.leadIndex.byIp.has(ip)) {
      lead = this.leadIndex.byIp.get(ip);
    }

    // 2. Query Postgres database if pool is connected and lead not yet resolved
    if (!lead && this.pool && (leadId || email || phone || visitorId)) {
      try {
        let queryText = 'SELECT id, name, email, phone, status, qualification, score FROM leads WHERE 1=0';
        const params = [];
        if (leadId) {
          params.push(leadId);
          queryText += ` OR id = $${params.length}`;
        }
        if (email) {
          params.push(email);
          queryText += ` OR LOWER(email) = LOWER($${params.length})`;
        }
        if (phone) {
          params.push(phone);
          queryText += ` OR phone = $${params.length}`;
        }
        if (visitorId) {
          params.push(visitorId);
          queryText += ` OR visitor_id = $${params.length}`;
        }
        queryText += ' LIMIT 1';

        const dbRes = await this.pool.query(queryText, params);
        if (dbRes.rows && dbRes.rows.length > 0) {
          lead = dbRes.rows[0];
        }
      } catch (err) {
        // Postgres query failed or table doesn't exist; continue gracefully
      }
    }

    // 3. Create or update lead entity if new info supplied
    if (info && (email || phone || name || leadId)) {
      const resolvedId = lead?.id || leadId || `lead_${crypto.randomBytes(6).toString('hex')}`;
      lead = {
        id: resolvedId,
        name: name || lead?.name || 'Anonymous Prospect',
        email: email || lead?.email || null,
        phone: phone || lead?.phone || null,
        status: lead?.status || 'Qualified',
        qualification: lead?.qualification || 'Warm'
      };
    }

    // 4. Update index cache
    if (lead) {
      this.leadIndex.byId.set(lead.id, lead);
      if (lead.email) this.leadIndex.byEmail.set(lead.email.toLowerCase(), lead);
      if (lead.phone) this.leadIndex.byPhone.set(lead.phone, lead);
      if (visitorId) this.leadIndex.byVisitor.set(visitorId, lead);
      if (ip) this.leadIndex.byIp.set(ip, lead);
    }

    return lead;
  }

  /**
   * Retroactively stitches anonymous sessions for a visitor to a newly identified lead
   */
  async stitchSessionsToLead(visitorId, lead) {
    if (!visitorId || !lead) return;
    const snapshot = await this.firestore.collection('sessions').where('visitor_id', '==', visitorId).get();
    for (const doc of snapshot.docs) {
      const s = doc.data();
      if (!s.lead_id || s.lead_id !== lead.id) {
        s.lead_id = lead.id;
        s.lead_name = lead.name;
        s.lead_email = lead.email;
        s.lead_phone = lead.phone;
        await this.saveSession(s);
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 15-MINUTE SLIDING WINDOW INGESTION ENGINE
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Main tracking ingestion method implementing the 15-minute sliding inactivity window.
   * 
   * @param {Object} params
   * @param {string} [params.visitorId] - Visitor fingerprint or client UUID
   * @param {string} [params.sessionId] - Existing session ID sent from browser
   * @param {string} [params.ip] - Remote client IP address
   * @param {string} [params.url] - Full visited URL
   * @param {string} [params.path] - Page path (e.g. "/life-insurance")
   * @param {string} [params.title] - Page title
   * @param {string} [params.referrer] - Referring URL
   * @param {Object} [params.metadata] - Device, screen, browser metadata
   * @param {Object} [params.leadInfo] - Identity details (email, phone, name, leadId)
   * @param {string|number|Date} [params.timestamp] - Optional timestamp for deterministic time simulation
   */
  async recordVisit({
    visitorId,
    sessionId,
    ip = '127.0.0.1',
    url,
    path = '/',
    title = '',
    referrer = '',
    metadata = {},
    leadInfo = null,
    timestamp = null
  }) {
    const now = timestamp ? new Date(timestamp) : new Date();
    const nowMs = now.getTime();

    // 1. Resolve / identify CRM Lead
    const effectiveVisitorId = visitorId || `vis_${crypto.randomBytes(6).toString('hex')}`;
    const linkedLead = await this.resolveLead(leadInfo, effectiveVisitorId, ip);

    let session = null;
    let isNewSession = false;

    // 2. Check if supplied sessionId exists
    if (sessionId && sessionId !== 'null' && sessionId !== 'undefined') {
      const candidate = await this.getSession(sessionId);
      if (candidate) {
        const lastActivityMs = new Date(candidate.last_activity_at).getTime();
        const startedMs = new Date(candidate.started_at).getTime();
        const inactiveGap = nowMs - lastActivityMs;
        const totalDuration = nowMs - startedMs;

        // Verify 15-minute sliding inactivity window & max session cap
        if (candidate.is_active && inactiveGap <= this.inactivityTimeoutMs && totalDuration <= MAX_SESSION_DURATION_MS) {
          session = candidate;
        } else {
          // Inactivity timeout triggered! Finalize stale session
          await this.finalizeSession(candidate.id, candidate.last_activity_at);
          session = null;
        }
      }
    }

    // 3. If no session found yet, check most recent active session for visitorId
    if (!session && effectiveVisitorId) {
      const activeCandidate = await this.getLatestActiveSession(effectiveVisitorId);
      if (activeCandidate) {
        const lastActivityMs = new Date(activeCandidate.last_activity_at).getTime();
        const startedMs = new Date(activeCandidate.started_at).getTime();
        const inactiveGap = nowMs - lastActivityMs;
        const totalDuration = nowMs - startedMs;

        if (inactiveGap <= this.inactivityTimeoutMs && totalDuration <= MAX_SESSION_DURATION_MS) {
          session = activeCandidate;
        } else {
          await this.finalizeSession(activeCandidate.id, activeCandidate.last_activity_at);
          session = null;
        }
      }
    }

    // 4. If still no active session, create a fresh session
    if (!session) {
      isNewSession = true;
      const newSessionId = this.generateSessionId(nowMs);
      session = {
        id: newSessionId,
        visitor_id: effectiveVisitorId,
        ip_address: ip,
        user_agent: metadata.userAgent || metadata.ua || '',
        device_type: metadata.deviceType || 'Desktop',
        lead_id: linkedLead?.id || null,
        lead_name: linkedLead?.name || null,
        lead_email: linkedLead?.email || null,
        lead_phone: linkedLead?.phone || null,
        is_active: true,
        started_at: now.toISOString(),
        last_activity_at: now.toISOString(),
        ended_at: null,
        duration_seconds: 0,
        page_count: 0,
        pages_visited: [],
        primary_interest: null,
        utm_source: metadata.utm_source || null,
        utm_campaign: metadata.utm_campaign || null
      };
    }

    // 5. Append page visit entry & update session heartbeats
    const visitEntry = {
      path: path || '/',
      url: url || path || '/',
      title: title || '',
      referrer: referrer || '',
      viewed_at: now.toISOString(),
      metadata: metadata || {}
    };

    session.pages_visited.push(visitEntry);
    session.page_count = session.pages_visited.length;
    session.last_activity_at = now.toISOString();

    const startedMs = new Date(session.started_at).getTime();
    session.duration_seconds = Math.max(0, Math.round((nowMs - startedMs) / 1000));

    // Update lead linkage on session if lead became known
    if (linkedLead) {
      session.lead_id = linkedLead.id;
      session.lead_name = linkedLead.name;
      session.lead_email = linkedLead.email;
      session.lead_phone = linkedLead.phone;
      // Retroactively stitch other sessions for this visitorId
      await this.stitchSessionsToLead(effectiveVisitorId, linkedLead);
    }

    // Auto-detect primary interest from visited pages
    session.primary_interest = this._detectPrimaryInterest(session.pages_visited);

    // Save updated session in Firestore
    await this.saveSession(session);

    // 6. Update Aggregate Behavioral Profile in Firestore
    const profile = await this.updateBehavioralProfile(session, linkedLead);

    return {
      success: true,
      sessionId: session.id,
      isNewSession,
      sessionDuration: session.duration_seconds,
      pageCount: session.page_count,
      leadLinked: !!session.lead_id,
      leadId: session.lead_id || null,
      primaryInterest: session.primary_interest,
      intentScore: profile.intent_score,
      qualification: profile.qualification
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // BEHAVIORAL PROFILING & AD RECOMMENDATIONS
  // ────────────────────────────────────────────────────────────────────────────

  _detectPrimaryInterest(pages) {
    const scores = { 'life-insurance': 0, 'real-estate': 0, 'securities': 0, 'annuities': 0, 'mortgage': 0 };
    for (const p of pages) {
      const text = `${p.path} ${p.title}`.toLowerCase();
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
          if (text.includes(kw)) {
            scores[cat] += 1;
          }
        }
      }
    }
    let topCat = 'life-insurance';
    let maxScore = -1;
    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topCat = cat;
      }
    }
    return maxScore > 0 ? topCat : 'life-insurance';
  }

  _calculateCategoryAffinity(allSessions) {
    const rawScores = {
      'life-insurance': 0,
      'real-estate': 0,
      'securities': 0,
      'annuities': 0,
      'mortgage': 0
    };

    for (const s of allSessions) {
      for (const p of (s.pages_visited || [])) {
        const text = `${p.path} ${p.title}`.toLowerCase();
        for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          for (const kw of keywords) {
            if (text.includes(kw)) {
              rawScores[cat] += 10;
              // High intent bonus on specific page
              if (HIGH_INTENT_KEYWORDS.some(k => text.includes(k))) {
                rawScores[cat] += 15;
              }
            }
          }
        }
      }
    }

    const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return { 'life-insurance': 20, 'real-estate': 20, 'securities': 20, 'annuities': 20, 'mortgage': 20 };
    }

    const normalized = {};
    for (const [cat, score] of Object.entries(rawScores)) {
      normalized[cat] = Math.round((score / total) * 100);
    }
    return normalized;
  }

  _calculateIntentScore(allSessions, lead) {
    let score = 15; // Base exploration score

    let totalPages = 0;
    let maxDuration = 0;
    let hasHighIntentPage = false;

    for (const s of allSessions) {
      totalPages += (s.page_count || 0);
      if (s.duration_seconds > maxDuration) {
        maxDuration = s.duration_seconds;
      }
      for (const p of (s.pages_visited || [])) {
        const text = `${p.path} ${p.title}`.toLowerCase();
        if (HIGH_INTENT_KEYWORDS.some(k => text.includes(k))) {
          hasHighIntentPage = true;
        }
      }
    }

    // Page depth (up to +30 points)
    score += Math.min(30, totalPages * 6);

    // High intent paths (quote, apply, calculator, schedule)
    if (hasHighIntentPage) {
      score += 25;
    }

    // Session frequency
    if (allSessions.length > 1) {
      score += 15;
    }
    if (allSessions.length > 2) {
      score += 10;
    }

    // Time on site
    if (maxDuration >= 300) { // 5+ minutes
      score += 10;
    } else if (maxDuration >= 60) {
      score += 5;
    }

    // Converted / lead provided
    if (lead && (lead.email || lead.phone || lead.id)) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  _generateTargetedAds(topCategory, intentScore) {
    const ads = [];

    switch (topCategory) {
      case 'life-insurance':
        ads.push({
          channel: 'Meta Ads',
          campaignTheme: 'High-Coverage Term Life & Family Protection',
          suggestedHeadline: 'Protect Your Family\'s Future with Top-Rated Term Life',
          creativeHook: 'Fast approvals with no medical exams on qualifying policies. Get your personalized rate in 60 seconds.',
          targetProduct: 'Life Insurance',
          recommendedLandingPage: '/life-insurance/quote'
        });
        ads.push({
          channel: 'Google Search',
          campaignTheme: 'Top Life Insurance Rates Comparison',
          suggestedHeadline: 'Compare 2026 Life Insurance Quotes — Instant Online Rates',
          creativeHook: 'Save up to 40% by comparing quotes from A-rated insurance carriers.',
          targetProduct: 'Life Insurance',
          recommendedLandingPage: '/life-insurance'
        });
        if (intentScore >= 75) {
          ads.push({
            channel: 'TV Retargeting',
            campaignTheme: 'VIP Wealth & Estate Preservation',
            suggestedHeadline: 'Complete Your Estate Plan with Premium Coverage',
            creativeHook: 'Direct concierge consultation with our senior underwriting team.',
            targetProduct: 'Life Insurance',
            recommendedLandingPage: '/schedule'
          });
        }
        break;

      case 'real-estate':
        ads.push({
          channel: 'Meta Ads',
          campaignTheme: 'Commercial & Residential Investment Wealth',
          suggestedHeadline: 'Build Generational Wealth with Premium Real Estate Assets',
          creativeHook: 'Exclusive access to off-market real estate investments and turnkey rental portfolios.',
          targetProduct: 'Real Estate',
          recommendedLandingPage: '/real-estate'
        });
        ads.push({
          channel: 'LinkedIn',
          campaignTheme: 'Institutional Real Estate Syndications',
          suggestedHeadline: 'Diversify Your Portfolio with Strategic Real Estate Allocations',
          creativeHook: 'Connect with our senior real estate advisors for tax-advantaged property acquisition.',
          targetProduct: 'Real Estate',
          recommendedLandingPage: '/real-estate/advisory'
        });
        break;

      case 'securities':
        ads.push({
          channel: 'Google Search',
          campaignTheme: 'Fiduciary Portfolio & Wealth Advisory',
          suggestedHeadline: 'Fee-Only Wealth Management & Custom Portfolios',
          creativeHook: 'Tailored equity and fixed-income strategies aligned with your risk tolerance.',
          targetProduct: 'Securities',
          recommendedLandingPage: '/securities'
        });
        ads.push({
          channel: 'LinkedIn',
          campaignTheme: 'Executive Wealth Management',
          suggestedHeadline: 'Preserve Capital and Optimize Yield in Any Market',
          creativeHook: 'Strategic asset allocation backed by institutional research.',
          targetProduct: 'Securities',
          recommendedLandingPage: '/securities/consultation'
        });
        break;

      case 'annuities':
        ads.push({
          channel: 'Google Search',
          campaignTheme: 'Guaranteed Retirement Income & Annuities',
          suggestedHeadline: 'Secure Guaranteed Lifetime Income with Fixed Index Annuities',
          creativeHook: 'Protect principal from market downturns while enjoying index-linked upside.',
          targetProduct: 'Annuities',
          recommendedLandingPage: '/annuities'
        });
        ads.push({
          channel: 'Meta Ads',
          campaignTheme: 'Retirement Peace of Mind',
          suggestedHeadline: 'Never Outlive Your Money — Explore 2026 Annuity Rates',
          creativeHook: 'Discover annuity options that pay guaranteed monthly income for life.',
          targetProduct: 'Annuities',
          recommendedLandingPage: '/annuities/calculator'
        });
        break;

      case 'mortgage':
      default:
        ads.push({
          channel: 'Google Search',
          campaignTheme: 'Competitive Home Loan & Refinance Rates',
          suggestedHeadline: 'Lower Your Monthly Mortgage Payment Today',
          creativeHook: 'Fast pre-approvals and transparent terms from experienced lending advisors.',
          targetProduct: 'Mortgage',
          recommendedLandingPage: '/mortgage'
        });
        break;
    }

    return ads;
  }

  _generateMarketingTags(allSessions, intentScore, topCategory, lead) {
    const tags = [];
    if (intentScore >= 75) tags.push('high_intent');
    else if (intentScore >= 40) tags.push('moderate_intent');
    else tags.push('exploratory');

    if (allSessions.length > 1) tags.push('repeat_visitor');
    
    let totalPages = 0;
    allSessions.forEach(s => { totalPages += (s.page_count || 0); });
    if (totalPages >= 4) tags.push('deep_browser');

    if (lead && lead.id) tags.push('crm_lead_linked');
    tags.push(`${topCategory.replace('-', '_')}_affinity`);

    return tags;
  }

  /**
   * Updates or creates the aggregate behavioral profile for the session's entity
   */
  async updateBehavioralProfile(session, lead) {
    const visitorId = session.visitor_id;
    const profileId = lead?.id || visitorId;

    // Collect all sessions for this visitor and/or lead
    const sessionsSnapshot = await this.firestore.collection('sessions').get();
    const allSessions = [];
    const ips = new Set();
    const recentPaths = [];

    sessionsSnapshot.forEach(doc => {
      const s = doc.data();
      const matchesVisitor = s.visitor_id === visitorId;
      const matchesLead = lead && s.lead_id === lead.id;
      if (matchesVisitor || matchesLead) {
        allSessions.push(s);
        if (s.ip_address) ips.add(s.ip_address);
        for (const p of (s.pages_visited || [])) {
          if (!recentPaths.includes(p.path)) {
            recentPaths.push(p.path);
          }
        }
      }
    });

    const totalSessions = allSessions.length;
    const totalPageViews = allSessions.reduce((acc, s) => acc + (s.page_count || 0), 0);
    const totalDurationSeconds = allSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

    const categoryAffinity = this._calculateCategoryAffinity(allSessions);
    
    // Determine top category
    let topCategory = 'life-insurance';
    let topScore = -1;
    for (const [cat, score] of Object.entries(categoryAffinity)) {
      if (score > topScore) {
        topScore = score;
        topCategory = cat;
      }
    }

    const intentScore = this._calculateIntentScore(allSessions, lead);
    const qualification = intentScore >= 75 ? 'Hot' : intentScore >= 40 ? 'Warm' : 'Cold';
    const targetedAds = this._generateTargetedAds(topCategory, intentScore);
    const marketingTags = this._generateMarketingTags(allSessions, intentScore, topCategory, lead);

    // Timestamps
    allSessions.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    const firstSeen = allSessions[0]?.started_at || session.started_at;
    const lastSeen = allSessions[allSessions.length - 1]?.last_activity_at || session.last_activity_at;

    const profileDoc = {
      id: profileId,
      visitor_id: visitorId,
      ip_addresses: Array.from(ips),
      linked_lead_id: lead?.id || null,
      lead_name: lead?.name || null,
      lead_email: lead?.email || null,
      lead_phone: lead?.phone || null,
      total_sessions: totalSessions,
      total_page_views: totalPageViews,
      total_duration_seconds: totalDurationSeconds,
      first_seen: firstSeen,
      last_seen: lastSeen,
      primary_category: topCategory,
      category_affinity: categoryAffinity,
      intent_score: intentScore,
      qualification,
      targeted_ad_recommendations: targetedAds,
      marketing_tags: marketingTags,
      recent_paths: recentPaths.slice(-10)
    };

    await this.saveProfile(profileDoc);

    // If lead was linked, also update under visitorId so lookups by visitorId or IP are synchronized
    if (lead && lead.id && visitorId && visitorId !== lead.id) {
      const visitorProfile = { ...profileDoc, id: visitorId };
      await this.saveProfile(visitorProfile);
    }

    return profileDoc;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // QUERY APIS FOR ADMIN DRILLDOWN & AUDIT
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Search and filter sessions by IP, user, visitorId, or leadId.
   */
  async querySessions({ ip, user, visitorId, leadId, limit = 50 }) {
    const snapshot = await this.firestore.collection('sessions').get();
    let sessions = [];

    const normUser = user ? user.trim().toLowerCase() : null;

    snapshot.forEach(doc => {
      const s = doc.data();
      let match = true;

      if (ip && s.ip_address !== ip) {
        match = false;
      }
      if (visitorId && s.visitor_id !== visitorId) {
        match = false;
      }
      if (leadId && s.lead_id !== leadId) {
        match = false;
      }
      if (normUser) {
        const matchesEmail = s.lead_email && s.lead_email.toLowerCase() === normUser;
        const matchesPhone = s.lead_phone && s.lead_phone === user;
        const matchesLeadId = s.lead_id && s.lead_id === user;
        const matchesVisitor = s.visitor_id && s.visitor_id === user;
        if (!matchesEmail && !matchesPhone && !matchesLeadId && !matchesVisitor) {
          match = false;
        }
      }

      if (match) {
        sessions.push(s);
      }
    });

    // Sort descending by started_at
    sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    if (limit) {
      sessions = sessions.slice(0, parseInt(limit, 10));
    }

    return {
      query: { ip, user, visitorId, leadId },
      totalSessions: sessions.length,
      sessions
    };
  }

  /**
   * Retrieves aggregated profile by IP, Visitor ID, Email, or Lead ID.
   */
  async getProfile(identifier) {
    if (!identifier) return null;

    const sessionsSnapshot = await this.firestore.collection('sessions').get();
    const matchingSessions = [];
    let linkedLead = null;
    let visitorId = null;

    const normId = identifier.trim().toLowerCase();

    // Check sessions for identifier match
    sessionsSnapshot.forEach(doc => {
      const s = doc.data();
      const matchIp = s.ip_address === identifier;
      const matchVisitor = s.visitor_id === identifier;
      const matchLeadId = s.lead_id === identifier;
      const matchEmail = s.lead_email && s.lead_email.toLowerCase() === normId;

      if (matchIp || matchVisitor || matchLeadId || matchEmail) {
        matchingSessions.push(s);
        if (!visitorId) visitorId = s.visitor_id;
        if (!linkedLead && (s.lead_id || s.lead_email)) {
          linkedLead = {
            id: s.lead_id,
            name: s.lead_name || 'CRM Lead',
            email: s.lead_email,
            phone: s.lead_phone,
            status: 'Qualified'
          };
        }
      }
    });

    // Also check leadIndex
    if (!linkedLead) {
      if (this.leadIndex.byId.has(identifier)) linkedLead = this.leadIndex.byId.get(identifier);
      else if (this.leadIndex.byEmail.has(normId)) linkedLead = this.leadIndex.byEmail.get(normId);
      else if (this.leadIndex.byVisitor.has(identifier)) linkedLead = this.leadIndex.byVisitor.get(identifier);
      else if (this.leadIndex.byIp.has(identifier)) linkedLead = this.leadIndex.byIp.get(identifier);
    }

    // If direct profile document exists in Firestore, fetch it
    let profile = null;
    if (linkedLead?.id) {
      profile = await this.getRawProfile(linkedLead.id);
    }
    if (!profile && visitorId) {
      profile = await this.getRawProfile(visitorId);
    }
    if (!profile) {
      profile = await this.getRawProfile(identifier);
    }

    // If profile document not saved yet but sessions found, calculate on the fly
    if (!profile && matchingSessions.length > 0) {
      profile = await this.updateBehavioralProfile(matchingSessions[0], linkedLead);
    }

    return {
      identifier,
      visitorId: visitorId || profile?.visitor_id || null,
      linkedLead: linkedLead || (profile?.linked_lead_id ? {
        id: profile.linked_lead_id,
        name: profile.lead_name,
        email: profile.lead_email,
        phone: profile.lead_phone,
        status: 'Qualified'
      } : null),
      behavioralProfile: profile ? {
        totalSessions: profile.total_sessions,
        totalPageViews: profile.total_page_views,
        totalDurationSeconds: profile.total_duration_seconds,
        firstSeen: profile.first_seen,
        lastSeen: profile.last_seen,
        intentScore: profile.intent_score,
        qualification: profile.qualification,
        primaryCategory: profile.primary_category,
        categoryAffinity: profile.category_affinity,
        targetedAdRecommendations: profile.targeted_ad_recommendations,
        marketingTags: profile.marketing_tags,
        recentPaths: profile.recent_paths
      } : null
    };
  }

  /**
   * Retrieves all unique tracked entities (IPs, visitors, leads) for admin selector dropdowns.
   */
  async getAllTrackedEntities() {
    const sessionsSnapshot = await this.firestore.collection('sessions').get();
    const ips = new Set();
    const visitors = new Set();
    const leadsMap = new Map();

    sessionsSnapshot.forEach(doc => {
      const s = doc.data();
      if (s.ip_address) ips.add(s.ip_address);
      if (s.visitor_id) visitors.add(s.visitor_id);
      if (s.lead_id) {
        leadsMap.set(s.lead_id, {
          id: s.lead_id,
          name: s.lead_name || 'CRM Lead',
          email: s.lead_email || null,
          phone: s.lead_phone || null
        });
      }
    });

    // Also include any leads in index
    for (const lead of this.leadIndex.byId.values()) {
      leadsMap.set(lead.id, {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone
      });
    }

    return {
      ips: Array.from(ips),
      visitors: Array.from(visitors),
      leads: Array.from(leadsMap.values())
    };
  }
}

// Export singleton and class
const behavioralTrackingService = new BehavioralTrackingService();

module.exports = {
  BehavioralTrackingService,
  behavioralTrackingService,
  InMemoryFirestoreStore,
  SESSION_INACTIVITY_TIMEOUT_MS
};
