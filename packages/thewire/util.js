const fs = require("fs");
const path = require("path");
const logUtil = require("./logUtil");

// Fungsi untuk memuat file dan direktori
module.exports.loadFiles = function(...dirNames) {
    dirNames.forEach((dirName) => {
        let finalPath = path.join(__dirname, dirName);

        fs.readdir(finalPath, (error, files) => {
            if (error) {
                logUtil.log.error(`Failed reading directory "${dirName}": ${error.message}`);
            } else {
                files.forEach((file) => {
                    try {
                        if (dirName === "scripts") {
                            require(path.join(finalPath, file)).init();
                        } else {
                            require(path.join(finalPath, file));
                        }

                        logUtil.log.info(`Loaded file "${file}" from "${dirName}".`);
                    } catch (e) {
                        logUtil.log.error(`Failed loading file "${file}" from "${dirName}": ${e.message}`);
                    }
                });
            }
        });
    });
};

// Fungsi untuk mengubah warna hex ke RGB
module.exports.hex2rgb = function(hex, alpha = 255) {
    let bigint = parseInt(hex.replace(/[^0-9A-F]/gi, ''), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, alpha];
};

// Fungsi untuk mendapatkan pemain dari tim tertentu
module.exports.getPlayersOfTeam = function(teamName) {
    return mp.players.toArray().filter(p => p.data.currentTeam === teamName);
};

// Fungsi untuk menghasilkan string acak
module.exports.generateRandomString = function(maxLength = 8) {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let string = "";
    for (let i = 0, charsLen = characters.length; i < maxLength; i++) string += characters[Math.floor(Math.random() * charsLen)];
    return string;
};

// Fungsi untuk menghasilkan angka acak
module.exports.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Fungsi untuk spawn kendaraan statis
function spawnStaticVehicles() {
    // Load data kendaraan dari JSON
    const vehicleDataPath = path.join(__dirname, "data", "serverVehicle.json");
    let vehicleData;

    try {
        vehicleData = JSON.parse(fs.readFileSync(vehicleDataPath));
    } catch (error) {
        logUtil.log.error(`Failed to load vehicle data from vehicles.json: ${error.message}`);
        return;
    }

    // Spawn setiap kendaraan dari data
    for (const vehicleInfo of vehicleData) {
        const vehicle = mp.vehicles.new(
            mp.joaat(vehicleInfo.model), // Model kendaraan
            new mp.Vector3(vehicleInfo.position.x, vehicleInfo.position.y, vehicleInfo.position.z), // Posisi kendaraan
            {
                heading: vehicleInfo.rotation.z, // Rotasi kendaraan
                color: [vehicleInfo.color1, vehicleInfo.color2], // Warna utama dan sekunder
                dimension: 0 // Dimension publik (0)
            }
        );
        logUtil.log.info(`Spawned vehicle ${vehicleInfo.model} at (${vehicleInfo.position.x}, ${vehicleInfo.position.y}, ${vehicleInfo.position.z})`);
    }
}

// Event saat server selesai dimulai
mp.events.add("serverStarted", () => {
    spawnStaticVehicles();
    logUtil.log.info("Static vehicles have been spawned on server start.");
});
