const formatDate = require("date-fns/format");
const teamData = require("../data/teamData");
const config = require("../config");
const database = require("../database");
const { updatePlayerMoneyInDatabase} = require("../events/accountEvents"); // Import functions here

// Server-Side Code
mp.events.addCommand("cuff", (player, _, targetId) => {
    // Ensure targetId is provided and is valid
    if (!targetId) {
        player.outputChatBox("Usage: /cuff [id]");
        return;
    }

    // Check if the player is logged in
    if (!player.isLoggedIn) {
        player.outputChatBox("You must be logged in to use this command.");
        return;
    }

    // Check if the player belongs to TEAM_ARMY or TEAM_POLICE
    if (player.data.currentTeam !== "TEAM_ARMY" && player.data.currentTeam !== "TEAM_POLICE") {
        player.outputChatBox("Only LEO team can use this command.");
        return;
    }

    const targetPlayer = mp.players.at(parseInt(targetId));
    if (!targetPlayer) {
        player.outputChatBox("Target player not found.");
        return;
    }

    // Check if target is logged in
    if (!targetPlayer.isLoggedIn) {
        player.outputChatBox("Target player must be logged in to cuff.");
        return;
    }

    // Check if target has a wanted level of at least 6
    if (targetPlayer.data.wanted < 6) {
        player.outputChatBox("You can only cuff players with a wanted level of 6 or higher.");
        return;
    }

    // Check if target is already cuffed
    if (targetPlayer.data.isCuffed) {
        player.outputChatBox("Target player is already cuffed.");
        return;
    }

    // Set target player's cuff status and play animation
    targetPlayer.data.isCuffed = true;
    targetPlayer.outputChatBox("You have been cuffed.");
    targetPlayer.call("playCuffAnimation");
    
    player.outputChatBox(`You have cuffed player ID ${targetId}.`);
});

mp.events.addCommand("arrest", (player, _, targetId) => {
    // Ensure targetId is provided and is valid
    if (!targetId) {
        player.outputChatBox("Usage: /arrest [id]");
        return;
    }

    // Check if the player is logged in
    if (!player.isLoggedIn) {
        player.outputChatBox("You must be logged in to use this command.");
        return;
    }

    // Check if the player belongs to TEAM_ARMY or TEAM_POLICE
    if (player.data.currentTeam !== "TEAM_ARMY" && player.data.currentTeam !== "TEAM_POLICE") {
        player.outputChatBox("Only LEO team can use this command.");
        return;
    }

    const targetPlayer = mp.players.at(parseInt(targetId));
    if (!targetPlayer) {
        player.outputChatBox("Target player not found.");
        return;
    }

    // Check if target is logged in
    if (!targetPlayer.isLoggedIn) {
        player.outputChatBox("Target player must be logged in to arrest.");
        return;
    }

    // Check if the target player is cuffed
    if (!targetPlayer.data.isCuffed) {
        player.outputChatBox("You can only arrest cuffed players.");
        return;
    }

    // Calculate the jail time and payment
    const wantedLevel = targetPlayer.data.wanted; // Assuming wanted level is already set
    const jailTime = (wantedLevel * 5) / 2; // Jail time in seconds
    const payment = wantedLevel * 1100; // Payment for the police
    const fineAmount = (wantedLevel * 5) / 2; // Amount to deduct from the arrested player

    // Teleport target player to a random jail location
    const jailLocations = [
        { x: 459.18, y: -997.69, z: 24.91 },
        { x: 460.26, y: -994.18, z: 24.91 },
        { x: 459.63, y: -1001.31, z: 24.91 }
    ];
    const selectedLocation = jailLocations[Math.floor(Math.random() * jailLocations.length)];
    
    targetPlayer.position = new mp.Vector3(selectedLocation.x, selectedLocation.y, selectedLocation.z);
    
    // Remove all weapons from the target player
    targetPlayer.removeAllWeapons();

    // Update player's wanted level and set jail time in the database
    targetPlayer.data.wanted = 0; // Reset wanted level
    targetPlayer.data.jailtime = jailTime; // Set the jail time

    // Update wanted level and jail time in the database
    database.pool.query("UPDATE accounts SET wanted = 0, jailtime = ? WHERE Username = ?", [jailTime, targetPlayer.accountName]);
    
    // Deduct money from the arrested player
    targetPlayer.changeMoney(-fineAmount); // Use changeMoney method to deduct money
    updatePlayerMoneyInDatabase(targetPlayer, -fineAmount); // Update in the database

    // Notify players
    targetPlayer.outputChatBox(`You have been arrested and are now in jail for !{#FF0000}${jailTime} !{#FFFFFF}seconds. You have been fined $${fineAmount}.`);
    targetPlayer.data.isCuffed = false; // Remove cuff status here
    targetPlayer.call("stopCuffAnimation"); // Calls client-side to stop the cuff animation

    // Give payment to the police officer
    player.changeMoney(payment); // Give money to the officer
    updatePlayerMoneyInDatabase(player, payment); // Update in the database
    player.outputChatBox(`You have arrested player ID !{#FF0000}${targetId}. !{#FFFFFF}You received !{#72CC72}$${payment} !{#FFFFFF}as a reward.`);

    // Start jail timer and update database
    targetPlayer.call("startJailTimer", [jailTime]); // Emit the start timer event with jail time

    let remainingTime = jailTime;

    const jailInterval = setInterval(() => {
        remainingTime--;

        // Update jailtime in database every minute (60 seconds)
        if (remainingTime % 60 === 0) {
            database.pool.query("UPDATE accounts SET jailtime = ? WHERE Username = ?", [remainingTime, targetPlayer.accountName]);
        }

        if (remainingTime <= 0) {
            clearInterval(jailInterval);
            targetPlayer.isCuffed = false;
            targetPlayer.position = new mp.Vector3(422.92, -978.69, 30.71); // Teleport player after jail time
            targetPlayer.outputChatBox("You are now free.");            
            targetPlayer.call("stopJailTimer"); // Stop the client-side timer
        }
    }, 1000); // 1 second interval
});

mp.events.add("playerArrested", (player) => {
    // Example: Jail time based on wanted level
    const wantedLevel = player.data.wanted; // Fetch player's wanted level
    const jailTime = (wantedLevel * 5) / 2; // Calculate jail time

    // Start the jail timer
    player.call("startJailTimer", [jailTime]);
});

// Server-side code
mp.events.addCommand("uncuff", (player, _, targetId) => {
    // Ensure targetId is provided and is valid
    if (!targetId) {
        player.outputChatBox("Usage: /uncuff [id]");
        return;
    }

    // Check if the player is logged in
    if (!player.isLoggedIn) {
        player.outputChatBox("You must be logged in to use this command.");
        return;
    }

    // Check if the player belongs to TEAM_ARMY or TEAM_POLICE
    if (player.data.currentTeam !== "TEAM_ARMY" && player.data.currentTeam !== "TEAM_POLICE") {
        player.outputChatBox("Only LEO team can use this command.");
        return;
    }

    const targetPlayer = mp.players.at(parseInt(targetId));
    if (!targetPlayer) {
        player.outputChatBox("Target player not found.");
        return;
    }

    // Check if target is logged in
    if (!targetPlayer.isLoggedIn) {
        player.outputChatBox("Target player must be logged in to uncuff.");
        return;
    }

    // Check if target is cuffed
    if (!targetPlayer.data.isCuffed) {
        player.outputChatBox("Target player is not cuffed.");
        return;
    }

    // Remove cuff status from target player
    targetPlayer.data.isCuffed = false;
    targetPlayer.outputChatBox("You have been uncuffed.");
    targetPlayer.call("stopCuffAnimation"); // Calls client-side to stop the cuff animation

    player.outputChatBox(`You have uncuffed player ID ${targetId}.`);
});
