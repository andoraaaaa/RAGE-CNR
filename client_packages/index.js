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

// Proxy untuk memantau variabel
var sharedDrawingVariables = new Proxy({}, {
    set: function(target, property, value) {
        let current = target[property];
        target[property] = value;

        mp.events.call("onDrawingVariableChange", property, current, value);
        return true;
    }
});

require("./vspawner/index.js");
require("./nativeui/index.js");

// Daftar file yang akan dimuat
const toLoad = [
    "scripts/changeDetect",
    "scripts/notifications",
    "scripts/headshots",
    "scripts/teams",
    "scripts/playerBlips",
    "scripts/welcome",
    "scripts/selection",
    "scripts/weaponShop",
    "scripts/firingModes",
    "scripts/cashregisters",
    "scripts/deathScreen",
    "scripts/crouch",
    "scripts/money",
    "scripts/spawnProtection",
    "scripts/killFeed",
    "scripts/garage",
    "scripts/turfs",
    "scripts/killstreaks",
    "scripts/discord",

    "ui/teamSelectionText",
    "ui/attachedToMinimap",
    "ui/money",
    "ui/killFeed",
    "ui/garageText"
];

require('./F2Key')

// Memuat semua file yang disebutkan
toLoad.forEach((file) => {
    try {
        require(file);
    } catch (e) {
        mp.gui.chat.push(`Failed to load "${file}". Error: ${e.message}`); // Menampilkan pesan kesalahan lebih detail
    }
});

// Set audio flag
mp.game.audio.setAudioFlag("LoadMPData", true);
