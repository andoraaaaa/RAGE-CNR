var sharedVariables = {
    localPlayer: mp.players.local,
    drawUI: false,
    drawFiringMode: false,
    drawTurfUI: false,
    selectionActive: false,
    garageActive: false,
    teamName: "Initial Team",
    firingModeText: "",
    moneyText: "",
    moneyDiffText: "",
    moneyDiffTime: 0,
    killFeedItems: [],
    currentVehicleText: "",
    turfText: "",
    killstreakText: "Killstreak: 0"
};

var sharedDrawingVariables = new Proxy(sharedVariables, {
    set: function(target, property, value) {
        target[property] = value;

        // Jika selectionActive diubah, tampilkan di konsol untuk memastikan
        if (property === 'selectionActive') {
            mp.console.logInfo(`selectionActive berubah: ${value}`);
        }

        mp.events.call("onDrawingVariableChange", property, value);
        return true;
    }
});

// Event untuk mengubah teamName dan selectionActive
mp.events.add("updateTeamSelection", (teamName, isActive) => {
    sharedDrawingVariables.teamName = teamName;
    sharedDrawingVariables.selectionActive = isActive;
});

// Render teks jika selectionActive aktif
mp.events.add("render", () => {
    if (sharedDrawingVariables.selectionActive) {
        // Menampilkan nama tim di layar saat di halaman pemilihan tim
        mp.game.graphics.drawText(sharedDrawingVariables.teamName, [0.5, 0.875], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.85, 0.85],
            outline: true
        });

        // Menampilkan instruksi
        mp.game.graphics.drawText("~r~Left~w~/~b~right ~w~arrow keys to switch between teams~n~Shift to spawn", [0.5, 0.925], {
            font: 0,
            color: [255, 255, 255, 255],
            scale: [0.4, 0.4],
            outline: true
        });
    }

    // Menampilkan text draw setelah player melakukan spawn
    mp.game.graphics.drawText("~g~CCS ~w~Cops and Robbers", [0.90, 0.85], {
        font: 7,
        color: [255, 255, 255, 200],
        scale: [0.65, 0.65],
        outline: true,
        align: 1 // Menempatkan teks di pojok kanan bawah
    });
});
