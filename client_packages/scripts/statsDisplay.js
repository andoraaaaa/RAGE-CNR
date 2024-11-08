let statsBrowser = undefined;
let statsEnabled = false;

mp.events.add("guiReady", () => {
    statsBrowser = mp.browsers.new("package://cef/playerStats.html"); // Mengarahkan ke file CEF untuk tampilan stats
    statsBrowser.active = false;
});

mp.events.add("displayPlayerStats", (display) => {
    statsEnabled = display;
    statsBrowser.active = display;
    mp.gui.cursor.visible = display;
});

mp.events.add("sendPlayerStats", (jsonData) => {
    statsBrowser.execute(`displayPlayerStats(${jsonData});`); // Kirim data statistik ke CEF
});

// Tombol ESC untuk menutup tampilan /stats
mp.keys.bind(0x1B, false, () => {
    if (statsEnabled) mp.events.call("displayPlayerStats", false);
});
