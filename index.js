function waitForAPI() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        function check() {
            if (window.SubwayBuilderAPI) resolve(window.SubwayBuilderAPI);
            else if (++attempts >= 60) reject(new Error("[Intercity HSR Trains] SubwayBuilderAPI not found after 30s"));
            else setTimeout(check, 500);
        }
        check();
    });
}

// Stats calibrated against the built-in v1.6.0 fleet:
//   tram 19.44 m/s / heavy-metro 24.72 / light-metro 27.78 / commuter-rail 35.76 m/s top speed;
//   accelerations 0.894-1.3 m/s^2; car costs 0.8M-3.5M; op costs 120-500/hr + 15-35/car/hr.
// Platform lengths use the game's formula: carLength * carCount + 4 (STATION_LENGTH_BUFFER).
async function initMod() {
    try {
        const API = await waitForAPI();
        console.log("[Intercity HSR Trains] Subway Builder API is ready:", API.version);

        // Express Metro (快速地铁) — strongest acceleration of the three, metro-scale capacity.
        API.trains.registerTrainType({
            id: 'express-metro',
            name: 'Express Metro',
            description: 'Express metro (快速地铁) with punchy acceleration and a higher top speed for express services with wider stop spacing.',
            stats: {
                maxAcceleration: 1.25,        // between light-metro (1.2) and tram (1.3): strongest of the three
                maxDeceleration: 1.3,
                maxSpeed: 30.56,              // m/s (~110 km/h) — between light-metro (27.78) and commuter-rail (35.76)
                maxSpeedLocalStation: 14,
                crossoverSpeed: 6.7,          // same as every built-in
                capacityPerCar: 220,
                carLength: 20,
                minCars: 2,
                maxCars: 8,
                carsPerCarSet: 2,
                carCost: 3_000_000,           // modest premium over heavy-metro's 2.7M
                trainWidth: 2.8,
                minStationLength: 44,         // 2 cars x 20 m + 4 m buffer
                maxStationLength: 164,        // 8 cars x 20 m + 4 m buffer
                baseTrackCost: 32_000,
                baseStationCost: 62_000_000,
                trainOperationalCostPerHour: 300,
                carOperationalCostPerHour: 28,
                stopTimeSeconds: 25,
                maxLateralAcceleration: 1,
                parallelTrackSpacing: 3.81,
                trackClearance: 1,
                minTurnRadius: 40,
                minStationTurnRadius: 500,
                maxSlopePercentage: 5,
                trackMaintenanceCostPerMeter: 400,
                stationMaintenanceCostPerYear: 340_000,
                tphLimit: 36,
            },
            compatibleTrackTypes: ['express-metro'],
            allowGradeCrossing: false,
            portalCost: 15_000_000,
            rampCost: 5_000_000,
            maxOverpassSpan: 65,
            appearance: {
                color: '#ff8c00'
            },
        });

        // Intercity Train (城际列车) — fast regional rail, high seated capacity, long consists.
        API.trains.registerTrainType({
            id: 'intercity-train',
            name: 'Intercity Train',
            description: 'Intercity/regional train (城际列车) linking city centres and suburbs at up to 180 km/h with high seated capacity.',
            stats: {
                maxAcceleration: 1.05,        // above commuter-rail's 0.894, below the metros
                maxDeceleration: 1.2,
                maxSpeed: 50,                 // m/s (180 km/h)
                maxSpeedLocalStation: 15,
                crossoverSpeed: 7.5,
                capacityPerCar: 140,          // seated layout: between commuter-rail (106) and metro density
                carLength: 25,
                minCars: 4,
                maxCars: 14,
                carsPerCarSet: 2,
                carCost: 4_200_000,           // a step above commuter-rail's 3.5M
                trainWidth: 3.1,
                minStationLength: 104,        // 4 cars x 25 m + 4 m buffer
                maxStationLength: 354,        // 14 cars x 25 m + 4 m buffer
                baseTrackCost: 28_000,
                baseStationCost: 58_000_000,
                trainOperationalCostPerHour: 600,
                carOperationalCostPerHour: 40,
                stopTimeSeconds: 35,
                maxLateralAcceleration: 1,
                parallelTrackSpacing: 4.27,
                trackClearance: 1.2,
                minTurnRadius: 170,
                minStationTurnRadius: 1600,
                maxSlopePercentage: 3,
                trackMaintenanceCostPerMeter: 380,
                stationMaintenanceCostPerYear: 360_000,
                tphLimit: 24,
            },
            compatibleTrackTypes: ['intercity-train'],
            allowGradeCrossing: false,
            portalCost: 18_000_000,
            rampCost: 6_000_000,
            maxOverpassSpan: 50,
            appearance: {
                color: '#7c3aed'
            },
        });

        // HSR (高速铁路) — very high top speed, longest trains, dedicated tracks.
        API.trains.registerTrainType({
            id: 'hsr',
            name: 'HSR',
            description: 'High-speed rail (高铁) running up to 324 km/h on its own dedicated tracks. Long trains, huge capacity, premium cost.',
            stats: {
                maxAcceleration: 0.9,         // lowest of the three (~80% of heavy-metro's 1.12); commuter-rail is playable at 0.894
                maxDeceleration: 1.0,
                maxSpeed: 90,                 // m/s (324 km/h)
                maxSpeedLocalStation: 15,
                crossoverSpeed: 8,
                capacityPerCar: 140,
                carLength: 25,
                minCars: 8,
                maxCars: 16,
                carsPerCarSet: 8,             // 8-car married sets; 16 cars = double unit
                carCost: 9_000_000,           // flagship: ~2.6x commuter-rail's 3.5M
                trainWidth: 3.36,
                minStationLength: 204,        // 8 cars x 25 m + 4 m buffer
                maxStationLength: 404,        // 16 cars x 25 m + 4 m buffer
                baseTrackCost: 45_000,
                baseStationCost: 80_000_000,
                trainOperationalCostPerHour: 900,
                carOperationalCostPerHour: 60,
                stopTimeSeconds: 40,
                maxLateralAcceleration: 1,
                parallelTrackSpacing: 4.6,
                trackClearance: 1.5,
                minTurnRadius: 300,
                minStationTurnRadius: 2000,
                maxSlopePercentage: 2.5,
                trackMaintenanceCostPerMeter: 450,
                stationMaintenanceCostPerYear: 400_000,
                tphLimit: 15,
            },
            compatibleTrackTypes: ['hsr'],
            allowGradeCrossing: false,
            portalCost: 25_000_000,
            rampCost: 8_000_000,
            maxOverpassSpan: 40,
            appearance: {
                color: '#e11d48'
            },
        });

        API.ui.showNotification('Intercity, HSR & Express Metro trains loaded!', 'success');

    } catch (error) {
        console.error("Mod init error:", error);
    }
}

console.log("[Intercity HSR Trains] mod loading...");
setTimeout(() => { initMod(); }, 100);
