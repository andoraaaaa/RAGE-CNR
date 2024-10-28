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
sharedDrawingVariables.resolution = mp.game.graphics.getScreenActiveResolution(0, 0);
sharedDrawingVariables.aspectRatio = mp.game.graphics.getScreenAspectRatio(false);
sharedDrawingVariables.safeZoneSize = mp.game.graphics.getSafeZoneSize();

setInterval(() => {
    // screen resolution
    let curResolution = mp.game.graphics.getScreenActiveResolution(0, 0);
    if (curResolution.x !== sharedDrawingVariables.resolution.x || curResolution.y !== sharedDrawingVariables.resolution.y) {
        sharedDrawingVariables.resolution = curResolution;
    }

    // aspect ratio
    let curAspectRatio = mp.game.graphics.getScreenAspectRatio(false);
    if (curAspectRatio !== sharedDrawingVariables.aspectRatio) {
        sharedDrawingVariables.aspectRatio = curAspectRatio;
    }

    // safezone size
    let curSafeZone = mp.game.graphics.getSafeZoneSize();
    if (curSafeZone !== sharedDrawingVariables.safeZoneSize) {
        sharedDrawingVariables.safeZoneSize = curSafeZone;
    }
}, 1000);