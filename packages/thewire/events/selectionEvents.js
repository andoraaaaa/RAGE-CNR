const database = require("../database");
const logUtil = require("../logUtil");
const teamData = require("../data/teamData");
const teams = Object.keys(teamData);

// Fungsi untuk mengecek wanted level dari database
function checkWantedLevel(player, callback) {
    const username = player.accountName; // Menggunakan accountName sebagai ID player
    const query = "SELECT wanted FROM accounts WHERE Username = ?";
    
    database.pool.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error checking wanted level:", err);
            return callback(null);
        }
        
        const wantedLevel = results[0] ? results[0].wanted : 0;
        callback(wantedLevel);
    });
}

const teamDataForClient = JSON.stringify(Object.keys(teamData).map((team) => {
    return {
        Name: teamData[team].Name,
        Color: teamData[team].ColorName,
        Skins: teamData[team].Skins
    };
}));

mp.events.add("playerReady", (player) => {
    player.call("receiveTeamData", [teamDataForClient]);
    player.call("updateTeamSelection", ["Select Team", true]);
});

mp.events.add("requestSpawn", (player, teamIdx, skinModel) => {
    if (teamIdx < 0 || teamIdx >= teams.length) {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Invalid team selected.");
        logUtil.log.warn(`Player ${player.name} selected invalid team ID (${teamIdx})`);
        return;
    }

    let teamName = teams[teamIdx];

    // Cek wanted level sebelum mengizinkan player memilih class
    checkWantedLevel(player, (wantedLevel) => {
        if (wantedLevel > 0 && (teamName === "TEAM_ARMY" || teamName === "TEAM_POLICE")) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You have wanted level on your civilian class. You can't spawn as !{#5DB6E5}LEO !{#FFFFFF}at this moment.");
            logUtil.log.warn(`Player ${player.name} with wanted level (${wantedLevel}) tried to join ${teamName}.`);
            return;
        }

        // Modifikasi TEAM__CIVILLIAN jika wanted level di atas 6
        if (teamName === "TEAM__CIVILLIAN" && wantedLevel > 6) {
            teamData[teamName].Name = "Criminals";
            teamData[teamName].ColorName = "HUD_COLOUR_RED";
            teamData[teamName].ColorHex = "#FF0000";
            teamData[teamName].BlipColor = 1; // BlipColor merah
        } else if (teamName === "TEAM__CIVILLIAN") {
            // Kembalikan nilai default jika wanted level 6 atau di bawah
            teamData[teamName].Name = "Civillian";
            teamData[teamName].ColorName = "HUD_COLOUR_WHITE";
            teamData[teamName].ColorHex = "#FFFFFF";
            teamData[teamName].BlipColor = 2;
        }
        
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
        player.call("updateTeamSelection", ["Select Team", false]);

        // Tentukan presence message berdasarkan wanted level
        const presenceName = wantedLevel > 150 ? `${player.accountName} (MOST WANTED)` : player.accountName;
        player.call("setDiscordPresence", [`RAGE CNR : ${presenceName}`, `Playing as ${teamData[teamName].Name}`]);
    });
});

mp.events.add("requestTeamSelection", (player) => {
    if (!player.spawnInTeamSelection) {
        player.spawnInTeamSelection = true;
        player.outputChatBox("You'll be sent to team selection on the next spawn.");
    }
});
