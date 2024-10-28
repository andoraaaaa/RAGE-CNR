const formatDate = require("date-fns/format");
const teamData = require("../data/teamData");
const config = require("../config");
const database = require("../database");

mp.events.addCommand("pm", (player, _, targetID, ...message) => {
    if (player.isLoggedIn) {
        targetID = Number(targetID);
        message = message.join(' ');

        if (isNaN(targetID) || message === undefined || message.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/pm [player ID] [message]");
            return;
        }

        if (player.id === targetID) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't PM yourself.");
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

        let playerColor = player.data.currentTeam ? teamData[player.data.currentTeam].ColorHex : "#FFFFFF";
        let targetColor = targetPlayer.data.currentTeam ? teamData[targetPlayer.data.currentTeam].ColorHex : "#FFFFFF";

        player.outputChatBox(`!{#F0C850}[PM SENT] !{${targetColor}}${targetPlayer.name}(${targetID}): !{#FFFFFF}${message}`);
        targetPlayer.outputChatBox(`!{#FF8555}[PM RECEIVED] !{${playerColor}}${player.name}(${player.id}): !{#FFFFFF}${message}`);

        if (config.dbLogging.privateChat) {
            database.pool.query("INSERT INTO log_privatechat SET SenderID=?, ReceiverID=?, Message=?", [player.sqlID, targetPlayer.sqlID, message]);
        }
    }
});

mp.events.addCommand("mywanted", (player) => {
    const username = player.accountName; // Assuming you're using 'username' to identify players
    const query = "SELECT wanted FROM accounts WHERE username = ?"; // Replace with your actual query

    database.pool.query(query, [username], (error, results) => {
        if (error) {
            player.outputChatBox("An error occurred while retrieving your wanted level.");
            console.error("Database query error:", error);
            return;
        }

        if (results.length > 0) {
            const wantedLevel = results[0].wanted; // Assuming 'wanted' is the column name
            player.outputChatBox(`Your current wanted level is: ${wantedLevel}`);
        } else {
            player.outputChatBox("Could not find your account information.");
        }
    });
});



mp.events.addCommand("stats", (player, targetID) => {
    if (player.isLoggedIn) {
        targetID = Number(targetID);
        if (isNaN(targetID)) targetID = player.id;

        let targetPlayer = targetID === player.id ? player : mp.players.at(targetID);
        if (!targetPlayer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player not found.");
            return;
        }

        if (!targetPlayer.isLoggedIn) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player didn't log in.");
            return;
        }

        player.outputChatBox(`Player Stats: !{${targetPlayer.data.currentTeam ? teamData[targetPlayer.data.currentTeam].ColorHex : "#FFFFFF"}}${targetPlayer.name}(${targetID})`);
        player.outputChatBox(`Account ID: !{#9B9B9B}${targetPlayer.sqlID}`);
        player.outputChatBox(`Kills: !{#9B9B9B}${targetPlayer.kills} !{#FFFFFF}| Deaths: !{#9B9B9B}${targetPlayer.deaths} !{#FFFFFF}| K/D Ratio: !{#9B9B9B}${((targetPlayer.deaths === 0) ? (targetPlayer.kills / 1) : (targetPlayer.kills / targetPlayer.deaths)).toFixed(3)}`);
        player.outputChatBox(`Money: !{#72CC72}$${targetPlayer.money} !{#FFFFFF}| Register Date: !{#9B9B9B}${formatDate(targetPlayer.regDate, "YYYY-MM-DD HH:mm:ss")}`);
    }
});

mp.events.addCommand("givemoney", (player, _, targetID, amount) => {
    if (player.isLoggedIn) {
        targetID = Number(targetID);
        amount = Number(amount);

        if (isNaN(targetID) || isNaN(amount) || amount < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/givemoney [player ID] [amount]");
            return;
        }

        if (player.id === targetID) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't give money to yourself.");
            return;
        }

        if (amount > player.money) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You don't have that much money.");
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

        let playerColor = player.data.currentTeam ? teamData[player.data.currentTeam].ColorHex : "#FFFFFF";
        let targetColor = targetPlayer.data.currentTeam ? teamData[targetPlayer.data.currentTeam].ColorHex : "#FFFFFF";

        player.changeMoney(-amount);
        targetPlayer.changeMoney(amount);
        targetPlayer.outputChatBox(`!{${playerColor}}${player.name}(${player.id}) !{#FFFFFF}gave you !{#72CC72}$${amount}.`);
        player.outputChatBox(`Gave !{#72CC72}$${amount} !{#FFFFFF}to !{${targetColor}}${targetPlayer.name}(${targetPlayer.id}).`);

        if (config.dbLogging.sentMoney) {
            database.pool.query("INSERT INTO log_sentmoney SET SenderID=?, ReceiverID=?, Amount=?", [player.sqlID, targetPlayer.sqlID, amount]);
        }
    }
});

mp.events.addCommand("top5", (player, ranking) => {
    if (player.isLoggedIn) {
        const rankingNames = ["kills", "money"];

        if (!rankingNames.includes(ranking)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/top5 [name]");
            player.outputChatBox(`!{#FF8555}SYNTAX: !{#FFFFFF}Available names: ${rankingNames.join(", ")}`);
            return;
        }

        let rankingPlayers = mp.players.toArray().filter(p => p.isLoggedIn);
        rankingPlayers.sort((a, b) => b[ranking] - a[ranking]);
        rankingPlayers = rankingPlayers.slice(0, 5);

        player.outputChatBox("==================================================");

        rankingPlayers.forEach((plr, idx) => {
            player.outputChatBox(`${idx + 1}. ${plr.name}(${plr.id}) - ${plr[ranking]} ${ranking}`);
        });

        player.outputChatBox("==================================================");
    }
});