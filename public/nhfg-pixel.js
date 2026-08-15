/**
 * NHFG Intelligence Pixel
 * A lightweight, cross-domain marketing tracking pixel.
 * Embed this script in the <head> of any external landing page or Shopify site.
 * Example: <script src="https://crm.newhollandfinancial.com/nhfg-pixel.js"></script>
 */

(function() {
    // Prevent double execution
    if (window.NHFGPixel) return;
    window.NHFGPixel = true;

    // Define the backend endpoint (must handle CORS)
    const ENDPOINT = 'https://crm.newhollandfinancial.com/api/analytics/collect';

    // 1. Get or Create Visitor ID
    function getVisitorId() {
        const KEY = 'nhfg_pixel_visitor_id';
        let id = localStorage.getItem(KEY);
        if (!id) {
            id = 'ext_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem(KEY, id);
        }
        return id;
    }

    // 2. Extract UTM Parameters from URL
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || '',
            medium: params.get('utm_medium') || '',
            campaign: params.get('utm_campaign') || '',
            term: params.get('utm_term') || '',
            content: params.get('utm_content') || ''
        };
    }

    // 3. Gather Metadata
    function getMetadata() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) deviceType = 'mobile';
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) deviceType = 'tablet';

        return {
            deviceType,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            utm: getUTMParams(),
            platform: 'external_marketing'
        };
    }

    // 4. Send Tracking Data
    function sendTrackingData(eventType = 'pageview') {
        const payload = {
            visitorId: getVisitorId(),
            sessionId: null, // External sessions are stateless
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            metadata: getMetadata(),
            eventMetadata: { type: eventType, timestamp: new Date().toISOString() }
        };

        // Use sendBeacon if possible to avoid blocking, otherwise fallback to fetch
        if (navigator.sendBeacon) {
            // sendBeacon requires FormData or Blob to handle CORS application/json cleanly sometimes, 
            // but stringified JSON is acceptable if backend accepts text/plain.
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(ENDPOINT, blob);
        } else {
            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => {});
        }
    }

    // Fire Initial Page View
    sendTrackingData('pageview');

    // Fire Exit Event on Close
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendTrackingData('exit');
        }
    });

})();
