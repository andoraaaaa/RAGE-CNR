const dateFns = require("date-fns");
const database = require("../database");
const logUtil = require("../logUtil");
const config = require("../config");

mp.events.addCommand("banplayer", (player, _, targetID, days, ...reason) => {
    if (player.isLoggedIn && player.admin > 0) {
        targetID = Number(targetID);
        days = Number(days);
        reason = reason.join(' ');

        if (isNaN(targetID) || isNaN(days) || days < 1 || reason === undefined || reason.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/banplayer [player ID] [days] [reason]");
            return;
        }

        if (player.id === targetID) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't ban yourself.");
            return;
        }

        let targetPlayer = mp.players.at(targetID);
        if (!targetPlayer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player not found.");
            return;
        }

        if (!targetPlayer.isLoggedIn) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player didn't log in.");
            return;
        }

        let endDate = dateFns.addDays(new Date(), days);
        database.pool.query("INSERT INTO bans SET AccountID=?, Reason=?, EndDate=?", [targetPlayer.sqlID, reason, endDate], (error, result) => {
            if (error) {
                logUtil.log.error(`Player banning failed: ${error.message}`);
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Failed to ban the specified player, check console for details.");
            } else {
                logUtil.igEventLog.info(`[BANPLAYER] ${player.name}(${player.id}) banned ${targetPlayer.name}(${targetPlayer.id}) with reason ${reason} for ${days} days.`);
                mp.players.broadcast(`!{#FF8555}BAN: !{FFFFFF}${targetPlayer.name}(${targetPlayer.id}) has been banned by ${player.name}(${player.id}) for ${days} day(s). (${reason})`);
                player.outputChatBox(`Banned ${targetPlayer.name} for ${days} day(s), their ban ID: ${result.insertId}.`);
                targetPlayer.kick();

                if (config.dbLogging.adminActions) {
                    database.pool.query("INSERT INTO log_admin SET AdminID=?, TargetID=?, Action='ACTION_BAN', Details=?", [player.sqlID, targetPlayer.sqlID, `Reason: ${reason} | Duration: ${days} days`]);
                }
            }
        });
    }
});

mp.events.addCommand("banaccount", (player, _, accountID, days, ...reason) => {
    if (player.isLoggedIn && player.admin > 0) {
        accountID = Number(accountID);
        days = Number(days);
        reason = reason.join(' ');

        if (isNaN(accountID) || isNaN(days) || days < 1 || reason === undefined || reason.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/banaccount [account ID] [days] [reason]");
            return;
        }

        if (player.sqlID === accountID) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't ban yourself.");
            return;
        }

        let endDate = dateFns.addDays(new Date(), days);
        database.pool.query("INSERT INTO bans SET AccountID=?, Reason=?, EndDate=?", [accountID, reason, endDate], (error, result) => {
            if (error) {
                logUtil.log.error(`Account banning failed: ${error.message}`);
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Failed to ban the specified account, check console for details.");
            } else {
                logUtil.igEventLog.info(`[BANACCOUNT] ${player.name}(${player.id}) banned account ID ${accountID} with reason ${reason} for ${days} days.`);
                player.outputChatBox(`Banned account #${accountID} for ${days} day(s), their ban ID: ${result.insertId}.`);

                let targetPlayer = mp.players.toArray().find(p => p.sqlID === accountID);
                if (targetPlayer) targetPlayer.kick();

                if (config.dbLogging.adminActions) {
                    database.pool.query("INSERT INTO log_admin SET AdminID=?, TargetID=?, Action='ACTION_BAN', Details=?", [player.sqlID, accountID, `Reason: ${reason} | Duration: ${days} days`]);
                }
            }
        });
    }
});

mp.events.addCommand("baninfo", (player, banID) => {
    if (player.isLoggedIn && player.admin > 0) {
        banID = Number(banID);

        if (isNaN(banID)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/baninfo [ban ID]");
            return;
        }

        database.pool.query("SELECT bans.*, accounts.Username FROM bans LEFT JOIN accounts ON bans.AccountID=accounts.ID WHERE bans.ID=? LIMIT 1", [banID], (error, result) => {
            if (error) {
                logUtil.log.error(`Ban retrieving failed: ${error.message}`);
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Failed to get information about the specified ban, check console for details.");
            } else {
                if (result.length > 0) {
                    player.outputChatBox(`Ban #${banID}:`);
                    player.outputChatBox(`Account: ${result[0].Username} (ID: ${result[0].AccountID})`);
                    player.outputChatBox(`Applied: ${dateFns.format(result[0].StartDate, "YYYY-MM-DD HH:mm:ss")} (${dateFns.distanceInWordsStrict(new Date(), result[0].StartDate, { addSuffix: true })})`);
                    player.outputChatBox(`Ends: ${dateFns.format(result[0].EndDate, "YYYY-MM-DD HH:mm:ss")} (${dateFns.distanceInWordsStrict(new Date(), result[0].EndDate, { addSuffix: true })})`);
                    player.outputChatBox(`Reason: ${result[0].Reason}`);
                } else {
                    player.outputChatBox("Nothing found, you might have entered an invalid ban ID.");
                }
            }
        });
    }
});

mp.events.addCommand("removeban", (player, banID) => {
    if (player.isLoggedIn && player.admin > 0) {
        banID = Number(banID);

        if (isNaN(banID)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/removeban [ban ID]");
            return;
        }

        database.pool.query("DELETE FROM bans WHERE ID=?", [banID], (error, result) => {
            if (error) {
                logUtil.log.error(`Ban removing failed: ${error.message}`);
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Failed to remove the specified ban, check console for details.");
            } else {
                if (result.affectedRows > 0) {
                    logUtil.igEventLog.info(`[REMOVEBAN] ${player.name}(${player.id}) removed ban ID ${banID}.`);
                    player.outputChatBox(`Removed ban #${banID}.`);
                } else {
                    player.outputChatBox("No changes made, you might have entered an invalid ban ID.");
                }
            }
        });
    }
});