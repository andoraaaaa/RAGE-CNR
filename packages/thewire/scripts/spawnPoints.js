const util = require("../util");
const teamData = require("../data/teamData");

module.exports.init = function() {
    for (let team in teamData) {
        // Ambil array SpawnPos yang memiliki beberapa koordinat spawn
        let spawnPoints = teamData[team].SpawnPos;

        // Untuk setiap spawn point di tim ini, buat Blip, Label, dan Marker
        spawnPoints.forEach((position, index) => {
            // Blip untuk setiap spawn point
            // mp.blips.new(480, new mp.Vector3(position.x, position.y, position.z), {
            //     name: `Spawn ${teamData[team].Name} ${index + 1}`,
            //     scale: 1.25,
            //     color: teamData[team].BlipColor,
            //     shortRange: true
            // });

            // Label untuk setiap spawn point
            mp.labels.new(`~${teamData[team].ColorName}~${teamData[team].Name} Spawn ${index + 1}`, 
                new mp.Vector3(position.x, position.y, position.z), {
                los: true,
                font: 4,
                drawDistance: 20.0,
                color: [255, 255, 255, 255]
            });

            // Marker untuk setiap spawn point
            mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 2.25), 2.0, {
                color: util.hex2rgb(teamData[team].ColorHex, 200)
            });
        });
    }
};
