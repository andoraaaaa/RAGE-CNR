const config = require("../config");
const teamData = require('../data/teamData.json');

mp.events.add("playerSpawn", (player) => {
    if (player.spawnInTeamSelection) {
        player.dimension = player.id + 1;
        player.spawnInTeamSelection = false;
        player.call("setSelectionState", [true]);
    } else {
        if (player.spawnProtectionTimer) clearTimeout(player.spawnProtectionTimer);

        // Ambil currentTeam saat spawn
        const currentTeam = player.data.currentTeam;

        if (config.spawnProtectionSeconds > 0) {
            player.spawnProtectionTimer = setTimeout(() => {
                player.data.spawnProtection = false;

                // Ambil senjata berdasarkan tim saat ini
                const teamWeapons = config.spawnWeapons[currentTeam] || config.spawnWeapons.default;
                teamWeapons.forEach((weapon) => player.giveWeapon(mp.joaat(weapon.Name), weapon.Ammo));

                player.outputChatBox("Spawn protection ended.");
                mp.players.call("showNotification", [`<C>${player.name}</C> Spawn as <C>${player.data.currentTeam}</C>`]);
                clearTimeout(player.spawnProtectionTimer);
                player.spawnProtectionTimer = undefined;
            }, config.spawnProtectionSeconds * 1000);

            player.data.spawnProtection = true;
            player.outputChatBox(`You're spawn protected for ${config.spawnProtectionSeconds} seconds.`);
        } else {
            // Ambil senjata berdasarkan tim saat ini
            const teamWeapons = config.spawnWeapons[currentTeam] || config.spawnWeapons.default;
            teamWeapons.forEach((weapon) => player.giveWeapon(mp.joaat(weapon.Name), weapon.Ammo));
        }
    }

    if (player.respawnTimer) {
        clearTimeout(player.respawnTimer);
        player.respawnTimer = undefined;
    }
});
