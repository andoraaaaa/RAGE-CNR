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

const drawX = 0.9975;
const drawY = 0.115;
const itemMargin = 0.04;
const itemHeight = 0.03;
const itemPadding = 0.005;
const halfItemHeight = itemHeight / 2;

const fontStyle = 4;
const fontScale = 0.45;

let finalDrawX = drawX - (1.0 - sharedDrawingVariables.safeZoneSize) * 0.5;
let finalDrawY = drawY + (1.0 - sharedDrawingVariables.safeZoneSize) * 0.5;

mp.events.add("onDrawingVariableChange", (varName, oldValue, newValue) => {
    if (varName === "safeZoneSize") {
        finalDrawX = drawX - (1.0 - newValue) * 0.5;
        finalDrawY = drawY + (1.0 - newValue) * 0.5;
    } else if (varName === "resolution" || varName === "aspectRatio") {
        for (let i = 0, max = sharedVariables.killFeedItems.length; i < max; i++) {
            sharedVariables.killFeedItems[i].TextWidth = util.getTextWidth(sharedVariables.killFeedItems[i].Text, fontStyle, fontScale);
        }
    }
});

mp.events.add("render", () => {
    if (sharedVariables.drawUI) {
        for (let i = 0, max = sharedVariables.killFeedItems.length; i < max; i++) {
            const calcDrawY = finalDrawY + (itemMargin * i);

            mp.game.graphics.drawRect(
                finalDrawX - (sharedVariables.killFeedItems[i].TextWidth / 2),
                calcDrawY,

                sharedVariables.killFeedItems[i].TextWidth + itemPadding,
                itemHeight + itemPadding,

                0, 0, 0, 150
            );

            util.drawText(sharedVariables.killFeedItems[i].Text, [finalDrawX, calcDrawY - halfItemHeight], fontScale, fontStyle, undefined, 2);
        }
    }
});