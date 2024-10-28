const logUtil = require("../logUtil");
const config = require("../config");
const weaponData = require("../data/weaponData");
const teamData = require("../data/teamData");
const database = require("../database");
const util = require("../util");

mp.events.add("playerDeath", (player, reason, killer) => {
    let readableReason = weaponData[reason] ? weaponData[reason].Name : reason;

    if (player.respawnTimer) clearTimeout(player.respawnTimer);
    player.respawnTimer = setTimeout(() => {
        player.spawn(teamData[player.data.currentTeam].SpawnPos);
        player.health = 100;
        player.dimension = 0;

        clearTimeout(player.respawnTimer);
        player.respawnTimer = undefined;
    }, 8000);

    if (killer && killer.id !== player.id) {
        logUtil.igEventLog.info(`[DEATH] ${killer.name} killed ${player.name}. (${readableReason})`);

        let killerTeam = killer.data.currentTeam;
        let playerTeam = player.data.currentTeam;
        let kTeam = teamData[killerTeam];
        let pTeam = teamData[playerTeam];

        if (killerTeam !== playerTeam) {
            let money = util.getRandomInt(config.killRewardMin, config.killRewardMax);

            player.deaths++;
            killer.kills++;
            killer.changeKillstreak(1);
            killer.changeMoney(money);

            killer.outputChatBox(`Earned !{#72CC72}$${money} !{#FFFFFF}for killing !{${pTeam.ColorHex}}${player.name}(${player.id}).`);
            player.outputChatBox(`Lost !{#72CC72}$${money} !{#FFFFFF}for dying.`);

            if (killer.killstreak % 5 === 0) {
                mp.players.broadcast(`!{${kTeam.ColorHex}}${killer.name}(${killer.id}) !{#FFFFFF}is on a killstreak with ${killer.killstreak} kills!`);

                let reward = Math.round(killer.killstreak * config.killstreakReward);
                killer.changeMoney(reward);
                killer.outputChatBox(`Earned !{#72CC72}$${reward} !{#FFFFFF}from your killstreak.`);
            }

            if (player.killstreak >= 5) {
                mp.players.broadcast(`!{${kTeam.ColorHex}}${killer.name}(${killer.id}) !{#FFFFFF}ended the killstreak of !{${pTeam.ColorHex}}${player.name}(${player.id}).`);

                let ksEndReward = Math.round(player.killstreak * Math.round(config.killstreakReward / 2));
                killer.changeMoney(ksEndReward);
                killer.outputChatBox(`Earned !{#72CC72}$${ksEndReward} !{#FFFFFF}for ending a killstreak.`);
            }

            player.changeMoney(-money);
            player.setKillstreak(0);
            player.removeAllWeapons();
        } else {
            killer.changeMoney(-config.teamKillPenalty);
            killer.outputChatBox(`Do not kill your team members! !{#72CC72}$${config.teamKillPenalty} !{#FFFFFF}taken as punishment.`);
            player.outputChatBox("!{#FF8555}UNFAIR DEATH: !{#FFFFFF}You'll keep your killstreak and weapons. This death also won't reflect on your K/D ratio.");
        }

        let feedMessage = `~${kTeam.ColorName}~${killer.name} ~w~killed ~${pTeam.ColorName}~${player.name}`;
        if (typeof readableReason === "string") feedMessage += ` ~w~with ${readableReason}`;
        mp.players.call("pushToKillFeed", [feedMessage]);

        if (config.dbLogging.deaths) {
            let playerPos = player.position;
            let killerPos = killer.position;

            database.pool.query("INSERT INTO log_deaths SET KillerID=?, PlayerID=?, KillerTeam=?, PlayerTeam=?, ReasonHash=?, KillerX=?, KillerY=?, KillerZ=?, PlayerX=?, PlayerY=?, PlayerZ=?",
                [killer.sqlID, player.sqlID, killer.data.currentTeam, player.data.currentTeam, reason, killerPos.x, killerPos.y, killerPos.z, playerPos.x, playerPos.y, playerPos.z]
            );
        }
    } else {
        logUtil.igEventLog.info(`[DEATH] ${player.name} died. (${readableReason})`);
        player.deaths++;
        player.setKillstreak(0);
        player.changeMoney(-100);
        player.removeAllWeapons();
        player.outputChatBox("Lost !{#72CC72}$100 !{#FFFFFF}for dying.");
    }

    player.data.isCrouched = false;
    player.call("hideTurfInfo");
});