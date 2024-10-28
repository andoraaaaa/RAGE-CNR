const logUtil = require("../logUtil");
const database = require("../database");
const config = require("../config");
const weaponData = require("../data/weaponData");
const weaponPrices = require("../data/weaponPrices");

const weapons = Object.keys(weaponPrices);
const shopListForClient = weapons.map((weapon) => {
    let hash = mp.joaat(weapon);

    return {
        Hash: hash,
        Name: weaponData[hash].Name,
        Class: weaponData[hash].Group,
        Price: weaponPrices[weapon]
    };
});

mp.events.add("playerEnterColshape", (player, colShape) => {
    if (player.isLoggedIn && colShape.weaponShopID && !player.vehicle) {
        if (player.spawnProtectionTimer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't interact with weapon shops while spawn protection is active.");
            return;
        }

        player.usingWeaponShop = colShape.weaponShopID;
        player.call("displayWeaponShop", [true]);
    }
});

mp.events.add("playerExitColshape", (player, colShape) => {
    if (colShape.weaponShopID && player.usingWeaponShop) {
        player.usingWeaponShop = undefined;
        player.call("displayWeaponShop", [false]);
    }
});

mp.events.add("requestWeaponData", (player) => {
    player.call("receiveWeaponData", [JSON.stringify(shopListForClient)]);
});

mp.events.add("requestWeaponPurchase", (player, idx) => {
    if (player.isLoggedIn && player.usingWeaponShop) {
        if (idx < 0 || idx >= shopListForClient.length) {
            player.call("receiveWeaponPurchase", ["Invalid weapon selected."]);
            logUtil.log.warn(`Player ${player.name} selected invalid weapon ID (${idx})`);
            return;
        }

        let shopWeapon = shopListForClient[idx];
        if (shopWeapon.Price > player.money) {
            player.call("receiveWeaponPurchase", ["You can't afford this weapon."]);
            player.call("showPictureNotification", ["Weapon Shop", "", "You can't afford this weapon.", "CHAR_AMMUNATION"]);
            return;
        }

        let hash = mp.joaat(weapons[idx]);
        player.giveWeapon(hash, weaponData[hash].DefaultClipSize === 0 ? 1 : weaponData[hash].DefaultClipSize * config.weaponShopMagCount);
        player.changeMoney(-shopWeapon.Price);
        player.call("receiveWeaponPurchase", ["OK"]);
        player.call("showPictureNotification", ["Weapon Shop", "", `Bought "${weaponData[hash].Name}" for ~HUD_COLOUR_GREEN~$${shopWeapon.Price}.`, "CHAR_AMMUNATION"]);

        if (config.dbLogging.weaponPurchases) {
            database.pool.query("INSERT INTO log_weaponshop SET AccountID=?, ShopID=?, WeaponHash=?", [player.sqlID, player.usingWeaponShop, hash]);
        }
    }
});