
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

        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [location.pathname]);

    return null;
};
