var sharedVariables = {
    localPlayer: mp.players.local,
    drawUI: false,
    drawFiringMode: false,
    drawTurfUI: false,
    selectionActive: false,
    garageActive: false,
    teamName: "",
    firingModeText: "",
    moneyText: "",
    moneyDiffText: "",
    moneyDiffTime: 0,
    killFeedItems: [],
    currentVehicleText: "",
    turfText: "",
    killstreakText: "Killstreak: 0"
};

var sharedDrawingVariables = new Proxy({}, {
    set: function(target, property, value) {
        let current = target[property];
        target[property] = value;

        mp.events.call("onDrawingVariableChange", property, current, value);
        return true;
    }
});
mp.events.add("render", () => {
    if (sharedVariables.localPlayer.hasBeenDamagedByAnyPed()) {
        if (sharedVariables.localPlayer.getLastDamageBone(0) === 31086) {
            let lastHitBy = null;

            mp.players.forEachInStreamRange((player) => {
                if (sharedVariables.localPlayer.hasBeenDamagedBy(player.handle, true)) lastHitBy = player;
            });

            if (lastHitBy && sharedVariables.localPlayer.getVariable("currentTeam") !== lastHitBy.getVariable("currentTeam")) {
                let pos = sharedVariables.localPlayer.position;
                mp.game.gameplay.shootSingleBulletBetweenCoords(pos.x, pos.y, pos.z, pos.x, pos.y, pos.z + 0.055, 50, false, lastHitBy.weapon, lastHitBy.handle, false, false, 9000.0);
            }
        }

        sharedVariables.localPlayer.clearLastDamage();
    }
});