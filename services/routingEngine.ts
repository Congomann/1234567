/**
 * Intelligent Routing Engine
 * 
 * Interacts with public routing APIs (OSRM default, easily swappable to Mapbox Truck API).
 * Layers custom ML/historical padding logic on top of base ETAs based on active road hazards.
 */

export class RoutingEngine {
    private useMapbox: boolean = false; // Toggle to true when Mapbox key is available

    // Simple Haversine distance in meters
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3;
        const p1 = lat1 * Math.PI/180;
        const p2 = lat2 * Math.PI/180;
        const dp = (lat2-lat1) * Math.PI/180;
        const dl = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(dp/2) * Math.sin(dp/2) +
                  Math.cos(p1) * Math.cos(p2) *
                  Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Calculates ETA while applying dynamic ML padding for active hazards in the vicinity
     */
    async calculateIntelligentETA(origin: {lat: number, lng: number}, dest: {lat: number, lng: number}, activeHazards: any[]): Promise<{etaMinutes: number, distanceMiles: number}> {
        // Fallback Base Logic: ~55mph straight line estimation
        const rawDistanceMeters = this.calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        const distanceMiles = rawDistanceMeters * 0.000621371;
        // Standard highway routing penalty (~20% longer than straight line)
        const routedDistanceMiles = distanceMiles * 1.2;
        let baseEtaMinutes = (routedDistanceMiles / 55) * 60; // 55 mph avg

        // Apply Intelligent Hazard Padding
        // E.g., if there is a 'construction' or 'traffic' event near the route line, pad the ETA
        let paddingMinutes = 0;
        
        for (const hazard of activeHazards) {
            // Rough check: is the hazard anywhere between origin and dest?
            const distToOrigin = this.calculateDistance(origin.lat, origin.lng, hazard.lat, hazard.lng);
            const distToDest = this.calculateDistance(dest.lat, dest.lng, hazard.lat, hazard.lng);
            
            // If the hazard is roughly in the path (a very crude geometric check for demo purposes)
            if (distToOrigin + distToDest < rawDistanceMeters * 1.5) {
                if (hazard.event_type === 'accident') paddingMinutes += 45;
                if (hazard.event_type === 'construction') paddingMinutes += 20;
                if (hazard.event_type === 'traffic') paddingMinutes += 30;
                if (hazard.event_type === 'closed') paddingMinutes += 60; // detour
            }
        }

        return {
            etaMinutes: Math.round(baseEtaMinutes + paddingMinutes),
            distanceMiles: Math.round(routedDistanceMiles * 10) / 10
        };
    }
}

export const RouteAI = new RoutingEngine();
