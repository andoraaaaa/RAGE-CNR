const database = require("../database");
const logUtil = require("../logUtil");
const teamData = require("../data/teamData");
const config = require("../config");
const util = require("../util");

let turfs = {};

function createTurfEntities(id, name, income, position, radius) {
    let colShape = mp.colshapes.newSphere(position.x, position.y, position.z, 4.0);
    colShape.turfID = id;

    turfs[id] = {
        name: name,
        income: income,
        colShape: colShape,

        marker: mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 7.5), 8.0, {
            color: [224, 50, 50, 255]
        }),

        label: mp.labels.new(`Turf (${id})~n~${name}~n~Income: ~HUD_COLOUR_GREEN~$${income}`, position,
        {
            los: true,
            font: 4,
            drawDistance: 20.0,
            color: [255, 255, 255, 255]
        }),

        // todo: uncomment after 0.4
        /* areaBlip: mp.blips.new(9, position, {
            color: 0,
            alpha: 150,
            shortRange: true,
            radius: radius
        }), */

        blip: mp.blips.new(164, position, {
            name: `Turf: ${name}`,
            scale: 1.25,
            color: 0,
            shortRange: true
        }),

        ownerTeam: undefined,
        capturingTeam: undefined,
        captureProgress: 0,
        captureTimer: undefined
    };
}

function deleteTurfEntities(id) {
    if (turfs[id]) {
        if (turfs[id].colShape) turfs[id].colShape.destroy();
        if (turfs[id].marker) turfs[id].marker.destroy();
        if (turfs[id].label) turfs[id].label.destroy();
        // if (turfs[id].areaBlip) turfs[id].areaBlip.destroy(); - todo: uncomment after 0.4
        if (turfs[id].blip) turfs[id].blip.destroy();

        turfs[id].ownerTeam = undefined;
        turfs[id].capturingTeam = undefined;
        turfs[id].captureProgress = 0;
        if (turfs[id].captureTimer) clearInterval(turfs[id].captureTimer);
        turfs[id].captureTimer = undefined;
    }
}

function giveTurfIncome() {
    Object.keys(teamData).forEach((teamName) => {
        let teamPlayers = util.getPlayersOfTeam(teamName);
        if (teamPlayers.length > 0) {
            let teamTurfs = Object.values(turfs).filter(t => t.ownerTeam === teamName);
            if (teamTurfs.length > 0) {
                let turfIncomeTotal = teamTurfs.reduce((total, curTurf) => {
                    return total + curTurf.income;
                }, 0);

                let turfIncomePlayer = Math.round(turfIncomeTotal / teamPlayers.length);
                teamPlayers.forEach((p) => {
                    p.changeMoney(turfIncomePlayer);

                    p.call("showPictureNotification", [
                        "Turf Income",
                        "",
                        `Got ~HUD_COLOUR_GREEN~$${turfIncomePlayer} ~w~from ${teamTurfs.length} owned turf(s).`,
                        "DIA_CUSTOMER"
                    ]);
                });
            }
        }
    });
}

module.exports.init = function() {
    database.pool.query("SELECT * FROM turfs", (error, rows) => {
        if (error) {
            logUtil.log.error(`Turf loading failed: ${error.message}`);
        } else {
            rows.forEach((row) => createTurfEntities(row.ID, row.Name, row.Income, new mp.Vector3(row.TurfX, row.TurfY, row.TurfZ), row.Radius));
            logUtil.log.info(`Loaded ${rows.length} turf(s).`);

            if (config.turfIncomeInterval > 0) setInterval(giveTurfIncome, config.turfIncomeInterval * 60000);
        }
    });
};

module.exports.turfs = turfs;

module.exports.createTurf = function(name, income, position, radius) {
    return new Promise((resolve, reject) => {
        database.pool.query("INSERT INTO turfs SET Name=?, Income=?, TurfX=?, TurfY=?, TurfZ=?, Radius=?", [name, income, position.x, position.y, position.z, radius], (error, result) => {
            if (error) {
                logUtil.log.error(`Turf adding failed: ${error.message}`);
                reject(error);
            } else {
                createTurfEntities(result.insertId, name, income, position, radius);
                resolve(result.insertId);
            }
        });
    });
};

module.exports.deleteTurf = function(id) {
    return new Promise((resolve, reject) => {
        database.pool.query("DELETE FROM turfs WHERE ID=?", [id], (error, result) => {
            if (error) {
                logUtil.log.error(`Turf removing failed: ${error.message}`);
                reject(error);
            } else {
                if (result.affectedRows > 0) {
                    deleteTurfEntities(id);
                    delete turfs[id];
                }

                resolve(result.affectedRows);
            }
        });
    });
};