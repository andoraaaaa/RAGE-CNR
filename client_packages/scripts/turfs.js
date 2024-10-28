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
mp.events.add("setTurfInfo", (name, currentProgress, maxProgress) => {
    sharedVariables.drawTurfUI = true;
    sharedVariables.turfText = `Capturing ${name} - ${Math.floor(currentProgress / maxProgress * 100)}%`;
});

mp.events.add("hideTurfInfo", () => {
    sharedVariables.drawTurfUI = false;
});