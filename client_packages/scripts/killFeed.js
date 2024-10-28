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
const util = require("./util");

const maxKillFeedItems = 5;
const killFeedItemLife = 30000;
const fontStyle = 4;
const fontScale = 0.45;

mp.events.add("pushToKillFeed", (message) => {
    if (sharedVariables.killFeedItems.length >= maxKillFeedItems) sharedVariables.killFeedItems.shift();

    sharedVariables.killFeedItems.push({
        Text: message,
        TextWidth: util.getTextWidth(message, fontStyle, fontScale),
        PushTime: Date.now()
    });
});

setInterval(() => {
    let now = Date.now();

    for (let i = sharedVariables.killFeedItems.length - 1; i >= 0; i--) {
        if (now - sharedVariables.killFeedItems[i].PushTime >= killFeedItemLife) sharedVariables.killFeedItems.splice(i, 1);
    }
}, 1000);