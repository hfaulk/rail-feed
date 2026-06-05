import express from 'express';
import stompit from 'stompit';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());

// Load the translation map into memory
const berthLocations = JSON.parse(fs.readFileSync('./berths.json', 'utf8'));

// The Memory Bank
const activeTrains = new Map();

// The API Endpoint Spotter will hit
app.get('/api/live-trains', (req, res) => {
    const features = [];
    
    for (const [headcode, data] of activeTrains.entries()) {
        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [data.lon, data.lat] // GeoJSON requires Longitude first!
            },
            properties: {
                headcode: headcode,
                berth: data.berth
            }
        });
    }

    res.json({
        type: "FeatureCollection",
        features: features
    });
});

// Connect to Network Rail Firehose
stompit.connect({
    host: 'datafeeds.networkrail.co.uk',
    port: 61618,
    connectHeaders: {
        host: '/',
        login: process.env.NR_EMAIL,
        passcode: process.env.NR_PASSWORD,
        'client-id': 'spotter-ingest'
    }
}, (error, client) => {
    if (error) return console.error('Connection failed:', error);
    console.log('Connected to Network Rail Firehose');

    client.subscribe({ destination: '/topic/TD_ALL_SIG_AREA', ack: 'auto' }, (error, message) => {
        if (error) return;

        message.readString('utf8', (error, body) => {
            if (!body) return;
            try {
                const updates = JSON.parse(body);
                updates.forEach(update => {
                    if (update.CA_MSG && update.CA_MSG.descr) {
                        const { descr, to_berth } = update.CA_MSG;
                        const location = berthLocations[to_berth];

                        // If we know where this berth is, update the train's location
                        if (location) {
                            activeTrains.set(descr, {
                                lon: location.lon,
                                lat: location.lat,
                                berth: to_berth,
                                last_updated: Date.now()
                            });
                        }
                    }
                });
            } catch (e) {
                // Ignore malformed JSON packets
            }
        });
    });
});

// Memory Sweep: Remove trains that haven't moved in 20 minutes
setInterval(() => {
    const now = Date.now();
    for (const [headcode, data] of activeTrains.entries()) {
        if (now - data.last_updated > 20 * 60 * 1000) {
            activeTrains.delete(headcode);
        }
    }
}, 60 * 1000);

app.listen(4000, () => console.log('Live Feed running on port 4000'));
