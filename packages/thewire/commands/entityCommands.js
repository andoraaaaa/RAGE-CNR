const database = require("../database");
const logUtil = require("../logUtil");
const weaponShopScript = require("../scripts/weaponShops");
const garageScript = require("../scripts/garages");
const turfScript = require("../scripts/turfs");

mp.events.addCommand("createweaponshop", (player) => {
    if (player.isLoggedIn && player.admin > 0) {
        weaponShopScript.createWeaponShop(player.position).then((id) => {
            player.outputChatBox(`Weapon shop created. ID: ${id}`);
        }, (error) => {
            player.outputChatBox("Failed to create a weapon shop, check console for details.");
        });
    }
});

mp.events.addCommand("removeweaponshop", (player, weaponShopID) => {
    if (player.isLoggedIn && player.admin > 0) {
        weaponShopID = Number(weaponShopID);

        if (isNaN(weaponShopID)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/removeweaponshop [ID]");
            return;
        }

        weaponShopScript.deleteWeaponShop(weaponShopID).then((affected) => {
            if (affected > 0) {
                player.outputChatBox(`Weapon shop #${weaponShopID} removed.`);

                let users = mp.players.toArray().filter(p => p.usingWeaponShop === weaponShopID);
                users.forEach((user) => {
                    user.usingWeaponShop = undefined;
                    user.call("displayWeaponShop", [false]);
                });
            } else {
                player.outputChatBox("No changes made, you might have entered an invalid weapon shop ID.");
            }
        }, (error) => {
            player.outputChatBox("Failed to remove weapon shop, check console for details.");
        });
    }
});

mp.events.addCommand("creategarage", (player) => {
    if (player.isLoggedIn && player.admin > 0) {
        garageScript.createGarage(player.position).then((id) => {
            player.outputChatBox(`Garage created. ID: ${id}`);
        }, (error) => {
            player.outputChatBox("Failed to create a garage, check console for details.");
        });
    }
});

mp.events.addCommand("removegarage", (player, garageID) => {
    if (player.isLoggedIn && player.admin > 0) {
        garageID = Number(garageID);

        if (isNaN(garageID)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/removegarage [ID]");
            return;
        }

        garageScript.deleteGarage(garageID).then((affected) => {
            if (affected > 0) {
                player.outputChatBox(`Garage #${garageID} removed.`);

                let users = mp.players.toArray().filter(p => p.usingGarage === garageID);
                users.forEach((user) => {
                    user.usingGarage = undefined;
                    user.leftGarageTimestamp = Date.now();
                    user.dimension = 0;
                    user.call("setGarageState", [false]);
                });
            } else {
                player.outputChatBox("No changes made, you might have entered an invalid garage ID.");
            }
        }, (error) => {
            player.outputChatBox("Failed to remove garage, check console for details.");
        });
    }
});

mp.events.addCommand("createturf", (player, _, income, radius, ...name) => {
    if (player.isLoggedIn && player.admin > 0) {
        income = Number(income);
        radius = parseFloat(radius);
        name = name.join(' ');

        if (isNaN(income) || isNaN(radius) || name === undefined || name.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/createturf [income] [radius] [name]");
            return;
        }

        turfScript.createTurf(name, income, player.position, radius).then((id) => {
            player.outputChatBox(`Turf created. ID: ${id}`);
        }, (error) => {
            player.outputChatBox("Failed to create a turf, check console for details.");
        });
    }
});

mp.events.addCommand("removeturf", (player, turfID) => {
    if (player.isLoggedIn && player.admin > 0) {
        turfID = Number(turfID);

        if (isNaN(turfID)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/removeturf [ID]");
            return;
        }

        turfScript.deleteTurf(turfID).then((affected) => {
            if (affected > 0) {
                player.outputChatBox(`Turf #${turfID} removed.`);

                let attackers = mp.players.toArray().filter(p => p.attackingTurf === turfID);
                attackers.forEach((p) => {
                    p.attackingTurf = undefined;
                    p.call("hideTurfInfo");
                });
            } else {
                player.outputChatBox("No changes made, you might have entered an invalid turf ID.");
            }
        }, (error) => {
            player.outputChatBox("Failed to remove turf, check console for details.");
        });
    }
});