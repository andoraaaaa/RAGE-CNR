const config = require("../config");
const teamData = require('../data/teamData.json');

mp.events.add("playerSpawn", (player) => {
    if (player.spawnInTeamSelection) {
        // Set dimension berdasarkan ID pemain untuk memisahkan antarpemain
        player.dimension = player.id + 1;
        player.spawnInTeamSelection = false;

        // Mengirimkan state untuk membuka menu pemilihan tim di client
        player.call("setSelectionState", [true]);
    } else {
        if (player.spawnProtectionTimer) clearTimeout(player.spawnProtectionTimer);

        // Ambil currentTeam saat spawn
        const currentTeam = player.data.currentTeam;

        // Pilih spawn point secara acak berdasarkan tim yang dipilih
        const spawnPoints = teamData[currentTeam].SpawnPos;
        const randomSpawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

        // Set posisi pemain ke spawn point yang dipilih
        player.position = new mp.Vector3(randomSpawn.x, randomSpawn.y, randomSpawn.z);
        player.spawn();

        if (config.spawnProtectionSeconds > 0) {
            // Spawn protection
            player.spawnProtectionTimer = setTimeout(() => {
                player.data.spawnProtection = false;

                // Ambil senjata berdasarkan tim saat ini
                const teamWeapons = config.spawnWeapons[currentTeam] || config.spawnWeapons.default;
                teamWeapons.forEach((weapon) => player.giveWeapon(mp.joaat(weapon.Name), weapon.Ammo));

                player.outputChatBox("!{#2aeee5}[SERVER] !{#FFFFFF}Spawn protection ended.");
                mp.players.call("showNotification", [`<C>${player.name}</C> Spawn as <C>${player.data.currentTeam}</C>`]);
                clearTimeout(player.spawnProtectionTimer);
                player.spawnProtectionTimer = undefined;
            }, config.spawnProtectionSeconds * 1000);

            player.data.spawnProtection = true;
            player.outputChatBox(`!{#2aeee5}[SERVER] !{#FFFFFF}You're spawn protected for ${config.spawnProtectionSeconds} seconds.`);
        } else {
            // Jika spawn protection tidak diaktifkan, langsung beri senjata
            const teamWeapons = config.spawnWeapons[currentTeam] || config.spawnWeapons.default;
            teamWeapons.forEach((weapon) => player.giveWeapon(mp.joaat(weapon.Name), weapon.Ammo));
        }
    }

    // Hapus respawn timer jika ada
    if (player.respawnTimer) {
        clearTimeout(player.respawnTimer);
        player.respawnTimer = undefined;
    }
});

