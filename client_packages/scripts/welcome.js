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
const cameraPos = new mp.Vector3(1865.045, -1754.456, 205.8218);
const cameraLookAtPos = new mp.Vector3(622.8427, -1553.021, 195.4714);

let accountBrowser = undefined;
let accountCamera = mp.cameras.new("accountCamera", cameraPos, new mp.Vector3(0.0, 0.0, 63.0), 24);

// Mengaktifkan kamera terlebih dahulu
accountCamera.setActive(true);
accountCamera.pointAtCoord(cameraLookAtPos.x, cameraLookAtPos.y, cameraLookAtPos.z); // Memastikan kita menggunakan angka

let waitingResponse = false;

mp.events.add("guiReady", () => {
    sharedVariables.localPlayer.setCoords(cameraPos.x, cameraPos.y, cameraPos.z - 5.0, false, false, false, false);
    sharedVariables.localPlayer.freezePosition(true);

    // Pindahkan pointAtCoord ke dalam event guiReady setelah setCoords
    if (accountCamera) {
        accountCamera.setActive(true);
        accountCamera.pointAtCoord(cameraLookAtPos.x, cameraLookAtPos.y, cameraLookAtPos.z);
    }

    accountBrowser = mp.browsers.new("package://cef/welcome.html");

    mp.gui.cursor.visible = true;
    mp.gui.chat.show(false);
    mp.game.ui.displayRadar(false);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
});

mp.events.add("sendLoginData", (username, password) => {
    if (!waitingResponse) {
        mp.events.callRemote("loginAccount", username, password);
        waitingResponse = true;
    }
});

mp.events.add("sendRegisterData", (username, password, verification) => {
    if (!waitingResponse) {
        mp.events.callRemote("registerAccount", username, password, verification);
        waitingResponse = true;
    }
});

mp.events.add("receiveAuthResult", (isSuccessful, resultBoxName, message) => {
    if (isSuccessful) {
        sharedVariables.localPlayer.freezePosition(false);

        if (accountBrowser) {
            accountBrowser.active = false;
            accountBrowser.destroy();
            accountBrowser = undefined;
        }

        if (accountCamera) {
            accountCamera.setActive(false);
            accountCamera.destroy();
            accountCamera = undefined;
        }

        mp.game.cam.renderScriptCams(false, false, 0, true, false);
        mp.game.ui.displayRadar(true);
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
        mp.events.call("setSelectionState", true);
    } else {
        if (accountBrowser) {
            accountBrowser.execute(`showResultBox("${resultBoxName}", "${message}")`);
            waitingResponse = false;
        }
    }
});