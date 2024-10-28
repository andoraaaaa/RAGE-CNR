const database = require("../database");
const logUtil = require("../logUtil");

let weaponShops = {};

function createWeaponShopEntities(id, position) {
    let colShape = mp.colshapes.newSphere(position.x, position.y, position.z, 1.0);
    colShape.weaponShopID = id;

    weaponShops[id] = {
        colShape: colShape,

        marker: mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 2.25), 2.0, {
            color: [224, 50, 50, 200]
        }),

        label: mp.labels.new(`Weapon Shop (${id})`, position,
        {
            los: true,
            font: 4,
            drawDistance: 20.0,
            color: [255, 255, 255, 255]
        }),

        blip: mp.blips.new(110, position, {
            name: "Weapon Shop",
            scale: 1.0,
            color: 0,
            shortRange: true
        })
    };
}

function deleteWeaponShopEntities(id) {
    if (weaponShops[id]) {
        if (weaponShops[id].colShape) weaponShops[id].colShape.destroy();
        if (weaponShops[id].marker) weaponShops[id].marker.destroy();
        if (weaponShops[id].label) weaponShops[id].label.destroy();
        if (weaponShops[id].blip) weaponShops[id].blip.destroy();
    }
}

module.exports.init = function() {
    database.pool.query("SELECT * FROM weapon_shops", (error, rows) => {
        if (error) {
            logUtil.log.error(`Weapon shop loading failed: ${error.message}`);
        } else {
            rows.forEach((row) => createWeaponShopEntities(row.ID, new mp.Vector3(row.ShopX, row.ShopY, row.ShopZ)));
            logUtil.log.info(`Loaded ${rows.length} weapon shop(s).`);
        }
    });
};

module.exports.createWeaponShop = function(position) {
    return new Promise((resolve, reject) => {
        database.pool.query("INSERT INTO weapon_shops SET ShopX=?, ShopY=?, ShopZ=?", [position.x, position.y, position.z], (error, result) => {
            if (error) {
                logUtil.log.error(`Weapon shop adding failed: ${error.message}`);
                reject(error);
            } else {
                createWeaponShopEntities(result.insertId, position);
                resolve(result.insertId);
            }
        });
    });
};

module.exports.deleteWeaponShop = function(id) {
    return new Promise((resolve, reject) => {
        database.pool.query("DELETE FROM weapon_shops WHERE ID=?", [id], (error, result) => {
            if (error) {
                logUtil.log.error(`Weapon shop removing failed: ${error.message}`);
                reject(error);
            } else {
                if (result.affectedRows > 0) {
                    deleteWeaponShopEntities(id);
                    delete weaponShops[id];
                }

                resolve(result.affectedRows);
            }
        });
    });
};