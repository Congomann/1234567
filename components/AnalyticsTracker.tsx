
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../services/analyticsService';

/**
 * Global Component to handle automatic tracking of user behavior.
 * This should be placed inside the Router context in App.tsx.
 */
export const AnalyticsTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Track the initial entry and subsequent route changes.
        AnalyticsService.trackPageView(location.pathname);

        // Heartbeat mechanism to track "Time on Website" effectively.
        const heartbeatInterval = setInterval(() => {
            AnalyticsService.sendHeartbeat();
        }, 30000); // Send heartbeat every 30 seconds

        const handleExit = () => {
            const visitorId = AnalyticsService.getVisitorId();
            const sessionId = AnalyticsService.getSessionId();
            if (!visitorId || !sessionId) return;

            const payload = JSON.stringify({
                visitorId,
                sessionId,
                url: window.location.href,
                path: window.location.pathname,
                eventMetadata: { type: 'exit', leaveTime: new Date().toISOString() }
            });
            
            // sendBeacon reliably posts data even as the tab is closing
            navigator.sendBeacon('/api/analytics/collect', payload);
        };

        window.addEventListener('pagehide', handleExit);
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                handleExit();
            }
        });

        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('pagehide', handleExit);
            window.removeEventListener('visibilitychange', handleExit);
        };
    }, [location.pathname]);

    return null;
};
