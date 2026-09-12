const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace('?sslmode=require&supa=base-pooler.x', ''),
  ssl: { rejectUnauthorized: false }
});

// Calculate distance using Haversine formula (meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
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

// Phase 2: Telemetry Ping Endpoint
router.post('/telemetry', async (req, res) => {
    const { load_id, lat, lng, speed, heading } = req.body;
    if (!load_id || !lat || !lng) return res.status(400).json({ error: 'Missing data' });

    try {
        // 1. Get the last ping for this load
        const lastPingRes = await pool.query('SELECT * FROM telematics_logs WHERE load_id = $1 ORDER BY recorded_at DESC LIMIT 1', [load_id]);
        
        let isIdle = false;
        
        if (lastPingRes.rows.length > 0) {
            const lastPing = lastPingRes.rows[0];
            const distance = calculateDistance(lastPing.lat, lastPing.lng, lat, lng);
            const timeDiffMinutes = (new Date() - new Date(lastPing.recorded_at)) / (1000 * 60);

            // If truck moved less than 500m in the last 30 minutes, it's IDLE.
            if (distance < 500 && timeDiffMinutes >= 30) {
                isIdle = true;
                
                // TODO: Send alert via CRM Live Event Feed
                console.log(`[Telematics] Alert: Load ${load_id} has been idle for ${timeDiffMinutes.toFixed(1)} minutes!`);
            }
        }

        // 2. Insert new ping
        await pool.query(
            'INSERT INTO telematics_logs (load_id, lat, lng, speed, heading) VALUES ($1, $2, $3, $4, $5)',
            [load_id, lat, lng, speed, heading]
        );

        // 3. Multi-stop logic: check waypoints
        const waypointsRes = await pool.query('SELECT * FROM load_waypoints WHERE load_id = $1 AND status = $2', [load_id, 'pending']);
        let completedStops = [];
        for (const wp of waypointsRes.rows) {
            const distToWaypoint = calculateDistance(wp.lat, wp.lng, lat, lng);
            if (distToWaypoint < 1000) { // within 1km
                await pool.query('UPDATE load_waypoints SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', wp.id]);
                completedStops.push(wp.id);
            }
        }

        res.json({ success: true, isIdle, completedStops });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Phase 3: Road Events Endpoint
router.post('/road-events', async (req, res) => {
    const { event_type, lat, lng, reported_by } = req.body;
    try {
        await pool.query(
            'INSERT INTO road_events (event_type, lat, lng, reported_by) VALUES ($1, $2, $3, $4)',
            [event_type, lat, lng, reported_by]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to report hazard' });
    }
});

router.get('/road-events', async (req, res) => {
    try {
        const events = await pool.query("SELECT * FROM road_events WHERE active = TRUE AND recorded_at > NOW() - INTERVAL '4 hours'");
        res.json(events.rows);
    } catch (err) {
        // if column recorded_at does not exist, use reported_at
        try {
            const events = await pool.query("SELECT * FROM road_events WHERE active = TRUE AND reported_at > NOW() - INTERVAL '4 hours'");
            res.json(events.rows);
        } catch (err2) {
             res.status(500).json({ error: 'Failed to fetch hazards' });
        }
    }
});

module.exports = router;
