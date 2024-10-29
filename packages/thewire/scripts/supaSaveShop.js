const database = require("../database");
const logUtil = require("../logUtil");

let supaSaveShops = {};

function createSupaSaveShopEntities(id, position) {
    let colShape = mp.colshapes.newSphere(position.x, position.y, position.z, 1.0);
    colShape.supaSaveShopID = id;

    supaSaveShops[id] = {
        colShape: colShape,

        marker: mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 2.25), 2.0, {
            color: [50, 224, 50, 200]
        }),

        label: mp.labels.new(`Supa Save (${id})`, position, {
            los: true,
            font: 4,
            drawDistance: 20.0,
            color: [255, 255, 255, 255]
        }),

        blip: mp.blips.new(52, position, { // Different blip for Supa Save
            name: "Supa Save",
            scale: 1.0,
            color: 1,
            shortRange: true
        })
    };
}

function deleteSupaSaveShopEntities(id) {
    if (supaSaveShops[id]) {
        if (supaSaveShops[id].colShape) supaSaveShops[id].colShape.destroy();
        if (supaSaveShops[id].marker) supaSaveShops[id].marker.destroy();
        if (supaSaveShops[id].label) supaSaveShops[id].label.destroy();
        if (supaSaveShops[id].blip) supaSaveShops[id].blip.destroy();
    }
}

module.exports.init = function() {
    database.pool.query("SELECT * FROM supa_save_shops", (error, rows) => {
        if (error) {
            logUtil.log.error(`Supa Save shop loading failed: ${error.message}`);
        } else {
            rows.forEach((row) => createSupaSaveShopEntities(row.ID, new mp.Vector3(row.ShopX, row.ShopY, row.ShopZ)));
            logUtil.log.info(`Loaded ${rows.length} Supa Save shop(s).`);
        }
    });
};

module.exports.createSupaSaveShop = function(position) {
    return new Promise((resolve, reject) => {
        database.pool.query("INSERT INTO supa_save_shops SET ShopX=?, ShopY=?, ShopZ=?", [position.x, position.y, position.z], (error, result) => {
            if (error) {
                logUtil.log.error(`Supa Save shop adding failed: ${error.message}`);
                reject(error);
            } else {
                createSupaSaveShopEntities(result.insertId, position);
                resolve(result.insertId);
            }
        });
    });
};

module.exports.deleteSupaSaveShop = function(id) {
    return new Promise((resolve, reject) => {
        database.pool.query("DELETE FROM supa_save_shops WHERE ID=?", [id], (error, result) => {
            if (error) {
                logUtil.log.error(`Supa Save shop removing failed: ${error.message}`);
                reject(error);
            } else {
                if (result.affectedRows > 0) {
                    deleteSupaSaveShopEntities(id);
                    delete supaSaveShops[id];
                }
                resolve(result.affectedRows);
            }
        });
    });
};
