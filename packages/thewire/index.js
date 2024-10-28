const database = require("./database");
const util = require("./util");
const fs = require('fs');
// Load kendaraan dari file JSON
require('./vspawner')
const vehicles = []; // Array untuk menyimpan kendaraan yang di-spawn

function loadVehiclesFromDatabase() {
    database.pool.query("SELECT * FROM vehicles", (error, results) => {
        if (error) {
            console.error(`Failed to load vehicles from database: ${error.message}`);
            return;
        }

        results.forEach(vehicleData => {
            const hash = mp.joaat(vehicleData.model); // Ubah nama model ke hash dengan mp.joaat
            const spawnPos = new mp.Vector3(vehicleData.position_x, vehicleData.position_y, vehicleData.position_z);
            const vehicle = mp.vehicles.new(hash, spawnPos, {
                heading: vehicleData.rotation_z,
                color: [[vehicleData.color1, vehicleData.color2]],
                locked: false
            });
            vehicles.push(vehicle); // Tambahkan kendaraan ke array
            console.log(`Spawned vehicle ID: ${vehicleData.id}, Model: ${vehicleData.model}`);
        });
        console.log(`Loaded ${results.length} vehicles from the database.`);
    });
}

// Load vehicles when server starts
mp.events.add("packagesLoaded", () => {
    loadVehiclesFromDatabase();
});


require('./cashregisters')
require('./currency-api')

database.init(() => {
    util.loadFiles("scripts", "events", "commands");
});