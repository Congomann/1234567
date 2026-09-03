(function() {
    // New Holland Financial Group - Universal Marketing Tracker
    // Tracks users across different sites using invisible device fingerprinting
    
    var endpoint = 'https://' + (document.currentScript ? new URL(document.currentScript.src).hostname : 'newhollandfinancial.com') + '/api/analytics/collect';
    
    function generateFingerprint() {
        var screen = window.screen.width + 'x' + window.screen.height + 'x' + window.screen.colorDepth;
        var lang = navigator.language;
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var cores = navigator.hardwareConcurrency || 1;
        var memory = navigator.deviceMemory || 1;
        var ua = navigator.userAgent;
        
        var str = screen + '-' + lang + '-' + tz + '-' + cores + '-' + memory + '-' + ua;
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    function getDeviceType() {
        var ua = navigator.userAgent || '';
        if (/iPhone/i.test(ua)) return 'iPhone';
        if (/iPad/i.test(ua)) return 'iPad';
        if (/Pixel/i.test(ua)) return 'Google Pixel';
        if (/Samsung|SM-|SGH-|SCH-/i.test(ua)) return 'Samsung';
        if (/Android/i.test(ua)) return 'Android Device';
        if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac / MacBook';
        if (/Windows NT/i.test(ua)) return 'Windows Laptop/PC';
        if (/Linux/i.test(ua)) return 'Linux Machine';
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|iP(hone|od)|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
        return "Desktop/Laptop";
    }

    var fingerprint = generateFingerprint();
    var entryTime = new Date().getTime();
    var sessionId = Math.random().toString(36).substring(2, 15);

    function track(type, extra) {
        var payload = {
            visitorId: 'fp_' + fingerprint,
            sessionId: sessionId,
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            metadata: Object.assign({
                deviceType: getDeviceType(),
                trackingFingerprint: fingerprint,
                screenResolution: window.screen.width + 'x' + window.screen.height,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timeOnSiteMs: new Date().getTime() - entryTime,
                eventType: type
            }, extra || {})
        };
        
        if (navigator.sendBeacon && type === 'exit') {
            navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(function(e) {});
        }
    }

    // Initial page load
    track('pageview');

    // Heartbeat every 30 seconds to accurately measure time on site
    setInterval(function() {
        track('heartbeat');
    }, 30000);

    // Track exit / time spent
    window.addEventListener('pagehide', function() { track('exit'); });
    window.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') track('exit');
    });
})();
