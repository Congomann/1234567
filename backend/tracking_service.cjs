const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.join(__dirname, 'tracking_data.json');

function getTrackingData() {
    if (!fs.existsSync(TRACKING_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(TRACKING_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveTrackingData(data) {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

function injectTrackingRoutes(app) {
    app.post('/api/tracking', (req, res) => {
        const session = req.body;
        if (!session || !session.id) {
            return res.status(400).json({ error: 'Invalid session data' });
        }
        
        let allSessions = getTrackingData();
        const existingIndex = allSessions.findIndex(s => s.id === session.id);
        
        if (existingIndex >= 0) {
            allSessions[existingIndex] = session;
        } else {
            allSessions.push(session);
        }
        
        saveTrackingData(allSessions);
        res.json({ success: true });
    });

    app.get('/api/tracking/all', (req, res) => {
        res.json(getTrackingData());
    });
}

module.exports = { injectTrackingRoutes };
