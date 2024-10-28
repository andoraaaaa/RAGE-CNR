const util = require("../util");
const teamData = require("../data/teamData");

module.exports.init = function() {
    for (let team in teamData) {
        let position = teamData[team].SpawnPos;

        mp.blips.new(480, position, {
            name: `Spawn: ${teamData[team].Name}`,
            scale: 1.25,
            color: teamData[team].BlipColor,
            shortRange: true
        });

        mp.labels.new(`~${teamData[team].ColorName}~${teamData[team].Name} Spawn`, position,
        {
            los: true,
            font: 4,
            drawDistance: 20.0,
            color: [255, 255, 255, 255]
        });

        mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 2.25), 2.0, {
            color: util.hex2rgb(teamData[team].ColorHex, 200)
        });
    }
};