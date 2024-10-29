const formatDate = require("date-fns/format");
const teamData = require("../data/teamData");
const config = require("../config");
const database = require("../database");

// Server-Side Code
// Server-side code
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
        player.outputChatBox("Only LEO team able to use this commands.");
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


// Server-side code
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
        player.outputChatBox("Only LEO team able to use this commands.");
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
