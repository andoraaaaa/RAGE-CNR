// Variabel untuk melacak status kursor
let cursorVisible = false;

// Fungsi untuk toggle kursor
mp.keys.bind(0x71, true, function() { // 0x71 adalah kode tombol F2
    cursorVisible = !cursorVisible;
    mp.gui.cursor.show(cursorVisible, cursorVisible); // Tampilkan atau sembunyikan kursor
});

mp.events.add("requestWaypointPosition", () => {
    const waypoint = mp.game.ui.getFirstBlipInfoId(8); // ID 8 adalah waypoint di peta
    if (!mp.game.ui.doesBlipExist(waypoint)) {
        mp.events.callRemote("sendWaypointPosition"); // Kirim kosong jika waypoint tidak ada
        return;
    }

    const waypointPos = mp.game.ui.getBlipInfoIdCoord(waypoint);
    if (!waypointPos) {
        mp.events.callRemote("sendWaypointPosition"); // Kirim kosong jika koordinat tidak valid
        return;
    }

    let zCoord = mp.game.gameplay.getGroundZFor3DCoord(waypointPos.x, waypointPos.y, waypointPos.z, false, false);
    if (!zCoord) {
        // Loop untuk mendapatkan nilai `z` (ketinggian tanah)
        for (let i = 1000; i >= 0; i -= 25) {
            mp.game.streaming.requestCollisionAtCoord(waypointPos.x, waypointPos.y, i);
            mp.game.wait(0);
        }
        zCoord = mp.game.gameplay.getGroundZFor3DCoord(waypointPos.x, waypointPos.y, 1000, false, false);
        if (!zCoord) {
            mp.events.callRemote("sendWaypointPosition"); // Kirim kosong jika gagal menemukan z
            return;
        }
    }

    // Kirim koordinat x, y, dan z ke server
    mp.events.callRemote("sendWaypointPosition", waypointPos.x, waypointPos.y, zCoord + 0.5);
});
