const logUtil = require("../logUtil");
const teamData = require("../data/teamData");
const teams = Object.keys(teamData);

const teamDataForClient = JSON.stringify(Object.keys(teamData).map((team) => {
    return {
        Name: teamData[team].Name,
        Color: teamData[team].ColorName,
        Skins: teamData[team].Skins
    };
}));

mp.events.add("playerReady", (player) => {
    player.call("receiveTeamData", [teamDataForClient]);
});

mp.events.add("requestSpawn", (player, teamIdx, skinModel) => {
    if (teamIdx < 0 || teamIdx >= teams.length) {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Invalid team selected.");
        logUtil.log.warn(`Player ${player.name} selected invalid team ID (${teamIdx})`);
        return;
    }

    let teamName = teams[teamIdx];
    if (!teamData[teamName].Skins.includes(skinModel)) {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Invalid skin for current team selected.");
        logUtil.log.warn(`Player ${player.name} selected invalid skin (${skinModel}) for team ID (${teamIdx})`);
        return;
    }

    player.data.currentTeam = teamName;
    player.data.blipColor = teamData[teamName].BlipColor;
    player.data.nametagColor = teamData[teamName].ColorName;

    player.model = mp.joaat(skinModel);
    player.dimension = 0;
    player.spawn(teamData[teamName].SpawnPos);
    player.call("setSelectionState", [false]);
    player.call("setDiscordPresence", [player.name, `Team: ${teamData[teamName].Name}`]);
});

mp.events.add("requestTeamSelection", (player) => {
    if (!player.spawnInTeamSelection) {
        player.spawnInTeamSelection = true;
        player.outputChatBox("You'll be sent to team selection on the next spawn.");
    }
});