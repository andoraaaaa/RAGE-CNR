const logUtil = require("../logUtil");

mp.events.add("playerQuit", (player, exitType) => {
    logUtil.igEventLog.info(`[QUIT] ${player.name} left. (${exitType})`);
    mp.players.call("showNotification", [`<C>${player.name}</C> left. (${exitType})`]);

    if (player.spawnProtectionTimer) clearTimeout(player.spawnProtectionTimer);
    if (player.respawnTimer) clearTimeout(player.respawnTimer);
    if (player.saveTimer) clearInterval(player.saveTimer);
    if (player.isLoggedIn) player.saveAccount();

    let playerVehicles = mp.vehicles.toArray().filter(v => v.spawnedBy === player.id);
    for (let i = playerVehicles.length - 1; i >= 0; i--) playerVehicles[i].destroy();
});