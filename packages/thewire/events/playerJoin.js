const logUtil = require("../logUtil");
const config = require("../config");
const database = require("../database");

mp.events.add("playerJoin", (player) => {
    logUtil.igEventLog.info(`[JOIN] ${player.name} joined. (ID: ${player.id} - SC: ${player.socialClub} - ${player.ip})`);
    mp.players.call("showNotification", [`<C>${player.name}</C> joined.`]);
    mp.players.broadcast(`!{#2aeee5}[SERVER] !{#FFFFFF}${player.name} joined.`);

    player.dimension = config.loginDimension;
    player.isLoggedIn = false;
    player.spawnInTeamSelection = false;
    player.killstreak = 0;
    player.leftGarageTimestamp = 0;
    player.healthChangeTimestamp = 0;

    player.sqlID = 0;
    player.admin = 0;
    player.money = 0;
    player.kills = 0;
    player.deaths = 0;
    player.regDate = new Date();

    player.setMoney = function(newAmount) {
        this.money = newAmount;
        this.call("updateMoneyDisplay", [this.money]);
    };

    player.changeMoney = function(amount) {
        this.money += amount;
        this.call("updateMoneyDisplay", [this.money]);
    };

    player.setKillstreak = function(newStreak) {
        this.killstreak = newStreak;
        this.call("updateKSDisplay", [this.killstreak]);
    };

    player.changeKillstreak = function(amount) {
        this.killstreak += amount;
        this.call("updateKSDisplay", [this.killstreak]);
    };

    player.saveAccount = function() {
        database.pool.query("UPDATE accounts SET Money=?, Kills=?, Deaths=? WHERE ID=?", [this.money, this.kills, this.deaths, this.sqlID], (error) => {
            if (error) {
                logUtil.log.error(`Account saving failed: ${error.message}`);
            }
        });
    };

    if (config.dbLogging.joins) {
        database.pool.query("INSERT INTO log_joins SET Name=?, SocialClub=?, Serial=?, IP=INET6_ATON(?)", [player.name, player.socialClub, player.serial, player.ip]);
    }
});