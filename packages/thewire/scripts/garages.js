const database = require("../database");
const logUtil = require("../logUtil");

let garages = {};

function createGarageEntities(id, position) {
    let colShape = mp.colshapes.newSphere(position.x, position.y, position.z, 1.0);
    colShape.garageID = id;

    garages[id] = {
        colShape: colShape,

        marker: mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 2.25), 2.0, {
            color: [224, 50, 50, 200]
        }),

        label: mp.labels.new(`Garage (${id})`, position,
        {
            los: true,
            font: 4,
            drawDistance: 20.0,
            color: [255, 255, 255, 255]
        }),

        blip: mp.blips.new(50, position, {
            name: "Garage",
            scale: 1.0,
            color: 0,
            shortRange: true
        })
    };
}

function deleteGarageEntities(id) {
    if (garages[id]) {
        if (garages[id].colShape) garages[id].colShape.destroy();
        if (garages[id].marker) garages[id].marker.destroy();
        if (garages[id].label) garages[id].label.destroy();
        if (garages[id].blip) garages[id].blip.destroy();
    }
}

module.exports.init = function() {
    database.pool.query("SELECT * FROM garages", (error, rows) => {
        if (error) {
            logUtil.log.error(`Garage loading failed: ${error.message}`);
        } else {
            rows.forEach((row) => createGarageEntities(row.ID, new mp.Vector3(row.GarageX, row.GarageY, row.GarageZ)));
            logUtil.log.info(`Loaded ${rows.length} garage(s).`);
        }
    });
};

module.exports.createGarage = function(position) {
    return new Promise((resolve, reject) => {
        database.pool.query("INSERT INTO garages SET GarageX=?, GarageY=?, GarageZ=?", [position.x, position.y, position.z], (error, result) => {
            if (error) {
                logUtil.log.error(`Garage adding failed: ${error.message}`);
                reject(error);
            } else {
                createGarageEntities(result.insertId, position);
                resolve(result.insertId);
            }
        });
    });
};

module.exports.deleteGarage = function(id) {
    return new Promise((resolve, reject) => {
        database.pool.query("DELETE FROM garages WHERE ID=?", [id], (error, result) => {
            if (error) {
                logUtil.log.error(`Garage removing failed: ${error.message}`);
                reject(error);
            } else {
                if (result.affectedRows > 0) {
                    deleteGarageEntities(id);
                    delete garages[id];
                }

                resolve(result.affectedRows);
            }
        });
    });
};