const logUtil = require("../logUtil");
const database = require("../database");
const supaSaveData = require("../data/supaSaveData");

mp.events.add("playerEnterColshape", (player, colShape) => {
    if (player.isLoggedIn && colShape.supaSaveShopID && !player.vehicle) {
        player.usingSupaSaveShop = colShape.supaSaveShopID;
        player.call("displaySupaSaveShop", [true]);
    }
});

mp.events.add("playerExitColshape", (player, colShape) => {
    if (colShape.supaSaveShopID && player.usingSupaSaveShop) {
        player.usingSupaSaveShop = undefined;
        player.call("displaySupaSaveShop", [false]);
    }
});

mp.events.add("requestSupaSaveData", (player) => {
    const items = Object.keys(supaSaveData).map((key) => ({
        Hash: supaSaveData[key].HashKey,
        Name: supaSaveData[key].Name,
        item_picture: supaSaveData[key].item_picture,
        Price: supaSaveData[key].Price,
        Description: supaSaveData[key].Description
    }));
    player.call("receiveSupaSaveData", [JSON.stringify(items)]);
});

mp.events.add("requestSupaSavePurchase", (player, idx) => {
    if (player.isLoggedIn && player.usingSupaSaveShop) {
        const item = supaSaveData[(idx + 1).toString()]; // Adjusting for zero-indexing
        if (!item) {
            player.call("receiveSupaSavePurchase", ["Invalid item selected."]);
            logUtil.log.warn(`Player ${player.name} selected invalid item ID (${idx})`);
            return;
        }

        if (item.Price > player.money) {
            player.call("receiveSupaSavePurchase", ["You can't afford this item."]);
            return;
        }

        player.changeMoney(-item.Price);
        player.call("receiveSupaSavePurchase", ["OK"]);
        player.call("showPictureNotification", ["Supa Save", "", `Bought "${item.Name}" for ~HUD_COLOUR_GREEN~$${item.Price}.`, "CHAR_AMMUNATION"]);
    }
});
