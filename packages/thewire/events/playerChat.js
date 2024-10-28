const logUtil = require("../logUtil");
const config = require("../config");
const database = require("../database");
const teamData = require("../data/teamData");
const util = require("../util");

mp.events.add("playerChat", (player, message) => {
    if (player.isLoggedIn) {
        if (message[0] === '!' && message.length > 1) {
            if (player.data.currentTeam) {
                message = message.slice(1);

                let teamColor = teamData[player.data.currentTeam].ColorHex;
                let msgToSend = `!{${teamColor}}[TEAM] ${player.name}(${player.id}): !{#FFFFFF}${message}`;
                util.getPlayersOfTeam(player.data.currentTeam).forEach((p) => p.outputChatBox(msgToSend));

                if (config.dbLogging.teamChat) {
                    database.pool.query("INSERT INTO log_teamchat SET AccountID=?, Team=?, Message=?", [player.sqlID, player.data.currentTeam, message]);
                }
            } else {
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't use the team chat without selecting a team.");
            }
        } else {
            let teamColor = player.data.currentTeam ? teamData[player.data.currentTeam].ColorHex : "#FFFFFF";

            logUtil.igEventLog.info(`[CHAT] ${player.name}(${player.id}): ${message}`);
            mp.players.broadcast(`!{${teamColor}}${player.name}(${player.id}): !{#FFFFFF}${message}`);

            if (config.dbLogging.chat) {
                database.pool.query("INSERT INTO log_chat SET AccountID=?, Message=?", [player.sqlID, message]);
            }
        }
    } else {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't use the chat without logging in.");
    }
});