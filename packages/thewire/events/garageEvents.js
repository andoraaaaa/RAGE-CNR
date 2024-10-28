const logUtil = require("../logUtil");
const database = require("../database");
const config = require("../config");
const teamData = require("../data/teamData");
const vehiclePrices = require("../data/vehiclePrices");
const util = require("../util");

mp.events.add("playerDamage", (player, healthLoss, armorLoss) => {
    player.healthChangeTimestamp = Date.now();
});

mp.events.add("playerEnterColshape", (player, colShape) => {
    if (player.isLoggedIn && colShape.garageID && !player.vehicle && Date.now() - player.leftGarageTimestamp > 3000) {
        if (Date.now() - player.healthChangeTimestamp < 20000) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't interact with garages if your health changed in the last 20 seconds.");
            return;
        }

        if (player.spawnProtectionTimer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't interact with garages while spawn protection is active.");
            return;
        }

        let data = {};
        teamData[player.data.currentTeam].Vehicles.forEach((model) => {
            data[model] = vehiclePrices[model];
        });

        player.dimension = player.id + 1;
        player.usingGarage = colShape.garageID;
        player.call("receiveVehicleData", [JSON.stringify(data), teamData[player.data.currentTeam].VehicleColor]);
    }
});

mp.events.add("requestVehiclePurchase", (player, model, spawnCoord) => {
    if (player.isLoggedIn && player.usingGarage) {
        if (!teamData[player.data.currentTeam].Vehicles.includes(model) || vehiclePrices[model] === undefined) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Invalid model selected.");
            logUtil.log.warn(`Player ${player.name} selected invalid vehicle model (${model})`);
            return;
        }

        let price = vehiclePrices[model];
        if (price > player.money) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't afford this vehicle.");
            return;
        }

        let vehicleCount = mp.vehicles.toArray().filter(veh => veh.spawnedBy === player.id).length;
        if (vehicleCount >= config.playerVehicleSpawnLimit) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't spawn any more vehicles.");
            return;
        }

        player.dimension = 0;
        player.changeMoney(-price);
        player.call("setGarageState", [false]);

        let hash = mp.joaat(model);
        let spawnPos = JSON.parse(spawnCoord);

        let veh = mp.vehicles.new(hash, spawnPos);
        veh.numberPlate = util.generateRandomString();
        veh.setColor(teamData[player.data.currentTeam].VehicleColor, teamData[player.data.currentTeam].VehicleColor);
        veh.spawnedBy = player.id;

        player.putIntoVehicle(veh, -1);

        if (config.dbLogging.garagePurchases) {
            database.pool.query("INSERT INTO log_garage SET AccountID=?, GarageID=?, VehicleHash=?, SpawnX=?, SpawnY=?, SpawnZ=?", [player.sqlID, player.usingGarage, hash, spawnPos.x, spawnPos.y, spawnPos.z]);
        }

        player.usingGarage = undefined;
        player.leftGarageTimestamp = Date.now();
    }
});

mp.events.add("leaveGarage", (player) => {
    player.usingGarage = undefined;
    player.leftGarageTimestamp = Date.now();
    player.dimension = 0;
    player.call("setGarageState", [false]);
});