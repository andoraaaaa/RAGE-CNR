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

const cameraPos = new mp.Vector3(178.46006774902344, -1008.3753051757812, -97.79759979248047);
const playerPos = new mp.Vector3(180.62255859375, -1000.5618286132812, -98.99986267089844);
const vehiclePos = new mp.Vector3(173.18955993652344, -1003.7760620117188, -99.49809265136719);
const vehicleRot = 180.0;

let vehicleData = undefined;
let vehicles = [];

let garageCamera = undefined;

let currentIdx = 0;
let previewVehicle = undefined;
let vehicleColor = 0;
let currentPosition = new mp.Vector3(0.0, 0.0, 0.0);

function changeModel(modelName) {
    let hash = mp.game.joaat(modelName);
    if (previewVehicle) previewVehicle.destroy();

    previewVehicle = mp.vehicles.new(hash, vehiclePos);
    previewVehicle.setHeading(vehicleRot);
    previewVehicle.setColours(vehicleColor, vehicleColor);
    previewVehicle.setNumberPlateText("FORSALE");

    sharedVariables.currentVehicleText = `${mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(hash))} ~HUD_COLOUR_GREEN~($${vehicleData[modelName]})`;
}

mp.events.add("receiveVehicleData", (jsonData, teamVehicleColor) => {
    vehicleData = JSON.parse(jsonData);
    vehicles = Object.keys(vehicleData);

    currentIdx = 0;
    vehicleColor = teamVehicleColor;

    mp.events.call("setGarageState", true);
});

mp.events.add("setGarageState", (enable) => {
    if (enable) {
        currentPosition = sharedVariables.localPlayer.position;

        sharedVariables.localPlayer.setCoordsNoOffset(playerPos.x, playerPos.y, playerPos.z, false, false, false);
        sharedVariables.localPlayer.freezePosition(true);

        garageCamera = mp.cameras.new("garageCamera", cameraPos, new mp.Vector3(-10.0, 0.0, 50.0), 45);

        // Tambahkan logging untuk memeriksa nilai vehiclePos
        console.log("Vehicle Position:", vehiclePos);
        console.log("Camera Position:", cameraPos);

        // Pastikan vehiclePos adalah objek yang valid
        if (vehiclePos instanceof mp.Vector3) {
            garageCamera.pointAtCoord(vehiclePos.x, vehiclePos.y, vehiclePos.z); // Perbaikan: Ambil nilai x, y, z
        } else {
            console.error("vehiclePos is not a valid mp.Vector3");
        }

        garageCamera.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.ui.displayRadar(false);

        changeModel(vehicles[0]);
    } else {
        sharedVariables.localPlayer.setCoordsNoOffset(currentPosition.x, currentPosition.y, currentPosition.z, false, false, false);
        sharedVariables.localPlayer.freezePosition(false);

        if (previewVehicle) { // Pastikan previewVehicle ada sebelum menghancurkannya
            previewVehicle.destroy();
            previewVehicle = undefined;
        }

        garageCamera.setActive(false);
        mp.game.cam.renderScriptCams(false, false, 0, true, false);
        mp.game.ui.displayRadar(true);

        garageCamera.destroy();
        garageCamera = undefined;
    }

    sharedVariables.garageActive = enable;
    sharedVariables.drawUI = !enable;
});

mp.events.add("render", () => {
    if (sharedVariables.garageActive) {
        mp.game.controls.disableAllControlActions(0);
    }
});

// Left arrow - previous model
mp.keys.bind(0x25, true, () => {
    if (sharedVariables.garageActive) {
        currentIdx = (currentIdx - 1 + vehicles.length) % vehicles.length;
        changeModel(vehicles[currentIdx]);
    }
});

// Right arrow - next model
mp.keys.bind(0x27, true, () => {
    if (sharedVariables.garageActive) {
        currentIdx = (currentIdx + 1) % vehicles.length; // Perbaikan: Tambahkan % vehicles.length
        changeModel(vehicles[currentIdx]);
    }
});

// Shift - request vehicle spawn
mp.keys.bind(0x10, false, () => {
    if (sharedVariables.garageActive) {
        let roadPosition = mp.game.pathfind.getNthClosestVehicleNode(currentPosition.x, currentPosition.y, currentPosition.z, 1, new mp.Vector3(), 1, 3.0, 0);
        mp.events.callRemote("requestVehiclePurchase", vehicles[currentIdx], JSON.stringify(roadPosition));
    }
});

// ESC - exit garage
mp.keys.bind(0x1B, false, () => {
    if (sharedVariables.garageActive) mp.events.callRemote("leaveGarage");
});
