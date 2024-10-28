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

// Ensure these positions are valid numbers
const cameraPos = new mp.Vector3(402.8877, -999.6817, -99.0);
const playerPos = new mp.Vector3(402.8664, -996.4108, -99.0);
const playerAngle = -180.0;

let teamData = undefined;
let skins = [];
let selectionCamera = undefined;

let currentIdx = 0;
let currentTeamIdx = -1;

function changeModel(modelName) {
    sharedVariables.localPlayer.model = mp.game.joaat(modelName);
    sharedVariables.localPlayer.clearTasksImmediately();
    sharedVariables.localPlayer.freezePosition(true);
    sharedVariables.localPlayer.taskStartScenarioInPlace("WORLD_HUMAN_GUARD_STAND", -1, false);

    currentTeamIdx = getTeamFromModel(modelName);
    sharedVariables.teamName = currentTeamIdx > -1 ? `~${teamData[currentTeamIdx].Color}~${teamData[currentTeamIdx].Name}` : "";
}

function getTeamFromModel(modelName) {
    for (let i = 0, max = teamData.length; i < max; i++) {
        if (teamData[i].Skins.includes(modelName)) {
            return i;
        }
    }

    return -1;
}

mp.events.add("receiveTeamData", (jsonData) => {
    teamData = JSON.parse(jsonData);
    teamData.forEach((team) => skins.push.apply(skins, team.Skins));

    changeModel(skins[0]);
});

mp.events.add("setSelectionState", (enable) => {
    if (enable) {
        // Ensure the player's coordinates and heading are set before activating the camera
        sharedVariables.localPlayer.setCoordsNoOffset(playerPos.x, playerPos.y, playerPos.z, false, false, false);
        sharedVariables.localPlayer.setHeading(playerAngle);
        sharedVariables.localPlayer.clearTasksImmediately();
        sharedVariables.localPlayer.freezePosition(true);
        sharedVariables.localPlayer.taskStartScenarioInPlace("WORLD_HUMAN_GUARD_STAND", -1, false);

        // Create the camera and check if it's successfully created
        selectionCamera = mp.cameras.new("selectionCamera", cameraPos, new mp.Vector3(0.0, 0.0, 0.0), 38);
        if (selectionCamera) {
            // Point the camera at the player's coordinates
            selectionCamera.pointAtCoord(playerPos.x, playerPos.y, playerPos.z);
            selectionCamera.setActive(true);

            mp.game.cam.renderScriptCams(true, false, 0, true, false);
            mp.game.ui.displayRadar(false);
        } else {
            mp.gui.chat.push("Failed to create the selection camera."); // Log an error if camera creation fails
        }
    } else {
        sharedVariables.localPlayer.freezePosition(false);

        if (selectionCamera) {
            selectionCamera.setActive(false);
            mp.game.cam.renderScriptCams(false, false, 0, true, false);
            mp.game.ui.displayRadar(true);

            selectionCamera.destroy();
            selectionCamera = undefined;
        }
    }

    sharedVariables.selectionActive = enable;
    sharedVariables.drawUI = !enable;
});

mp.events.add("render", () => {
    if (sharedVariables.selectionActive) {
        mp.game.controls.disableAllControlActions(0);
    }
});

// Left arrow - previous skin
mp.keys.bind(0x25, true, () => {
    if (sharedVariables.selectionActive) {
        currentIdx = (currentIdx - 1 + skins.length) % skins.length;
        changeModel(skins[currentIdx]);
    }
});

// Right arrow - next skin
mp.keys.bind(0x27, true, () => {
    if (sharedVariables.selectionActive) {
        currentIdx = (currentIdx + 1 + skins.length) % skins.length;
        changeModel(skins[currentIdx]);
    }
});

// Shift - request spawn
mp.keys.bind(0x10, false, () => {
    if (sharedVariables.selectionActive) mp.events.callRemote("requestSpawn", currentTeamIdx, skins[currentIdx]);
});

// F4 - request team selection
mp.keys.bind(0x73, false, () => {
    if (!sharedVariables.selectionActive) mp.events.callRemote("requestTeamSelection");
});
