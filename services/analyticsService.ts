
/**
 * NHFG ANALYTICS SERVICE
 * Tracks visitor behavior, sessions, and page views across the CRM and external sites.
 */

const VISITOR_ID_KEY = 'nhfg_visitor_id';
const SESSION_ID_KEY = 'nhfg_session_id';

const getVisitorId = () => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
        id = `vis_${crypto.randomUUID()}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
};

const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_ID_KEY);
};

const setSessionId = (id: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_ID_KEY, id);
};

const getDeviceType = () => {
    if (typeof navigator === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
    return "desktop";
};

export const AnalyticsService = {
    getVisitorId,

    trackPageView: async (path: string, title?: string, extraMetadata: any = {}) => {
        const visitorId = getVisitorId();
        const sessionId = getSessionId();

        try {
            const response = await fetch('/api/analytics/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    sessionId,
                    url: window.location.href,
                    path: path || window.location.pathname,
                    title: title || document.title,
                    referrer: document.referrer,
                    metadata: {
                        deviceType: getDeviceType(),
                        screenResolution: `${window.screen.width}x${window.screen.height}`,
                        language: navigator.language,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        ...extraMetadata
                    }
                })
            });

            if (response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    if (data && data.sessionId) {
                        setSessionId(data.sessionId);
                    }
                } catch (e) {
                    // Ignore non-JSON body
                }
            }
        } catch (err) {
            // Quietly catch analytics network issues
        }
    },

    sendHeartbeat: async () => {
        const visitorId = getVisitorId();
        const sessionId = getSessionId();
        if (!sessionId || sessionId === 'null') return;

        try {
            await fetch('/api/analytics/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId, sessionId })
            });
        } catch (err) { }
    },

    deleteUserData: async (visitorId: string) => {
        // This is usually called from Admin Portal on behalf of a user request
        try {
            const token = localStorage.getItem('nhfg_access_token');
            const response = await fetch(`/api/admin/analytics/visitors/${visitorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (err) {
            console.error('[Analytics] Deletion failed:', err);
            return { error: 'Failed to delete data' };
        }
    }
};
