// Variabel untuk melacak status kursor
let cursorVisible = false;

// Fungsi untuk toggle kursor
mp.keys.bind(0x71, true, function () { // 0x71 adalah kode tombol F2
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

mp.events.add("startPickupAnimation", () => {
    const animDict = "random@atmrobberygen"; // Dictionary animasi untuk pengambilan uang
    const animName = "pickup_low"; // Menggunakan animasi mengambil uang dari lantai

    // Preload animasi
    mp.game.streaming.requestAnimDict(animDict);
    while (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
        mp.game.wait(0);
    }

    // Memulai animasi
    mp.players.local.taskPlayAnim(animDict, animName, 8.0, -8, -1, 1, 0, false, false, false);

    // Berhenti animasi setelah 2 detik (sesuai durasi animasi)
    setTimeout(() => {
        mp.players.local.stopAnimTask(animDict, animName, 3.0);
    }, 2000);
});

// Client-Side Code for Countdown Display
let jailTimerTextDraw; // Declare the text draw variable
let blinkVisible = true; // Control visibility of the timer number
let jailInterval; // Store interval reference
let remainingTime = 0; // Track remaining jail time

mp.events.add("startJailTimer", (jailTime) => {
    remainingTime = jailTime;

    // Clear previous interval if any
    if (jailInterval) clearInterval(jailInterval);

    // Start the interval for the countdown
    jailInterval = setInterval(() => {
        remainingTime--;

        // Blink logic for the timer
        blinkVisible = !blinkVisible; // Toggle visibility for blinking effect

        // Check if the time has expired
        if (remainingTime <= 0) {
            clearInterval(jailInterval);
            mp.gui.chat.push("You are now free."); // Notify the player

            // Reset remainingTime after release
            remainingTime = 0;
        }
    }, 1000); // Update every second
});

// Keep rendering the static text and the countdown timer
mp.events.add("render", () => {
    if (remainingTime > 0) {
        // Draw the static jail message
        mp.game.graphics.drawText("You have been arrested and are now in jail.", [0.5, 0.11], {
            font: 0,
            color: [255, 255, 255, 255],
            scale: [0.5, 0.5],
            outline: true
        });
        mp.game.graphics.drawText("Time Remaining :", [0.5, 0.15], {
            font: 0,
            color: [255, 0, 0, 255],
            scale: [0.5, 0.5],
            outline: true
        });

        // Draw the blinking timer text only if blinkVisible is true
        if (blinkVisible) {
            mp.game.graphics.drawText(remainingTime + " seconds", [0.5, 0.19], {
                font: 0,
                color: [255, 0, 0, 255],
                scale: [0.5, 0.5],
                outline: true
            });
        }
    }
});

// client-side script
let radioDisabled = false; // Status awal di client

// Event untuk memperbarui status radio
mp.events.add('updateRadioStatus', (status) => {
    radioDisabled = status;

    if (radioDisabled) {
        mp.game.audio.setRadioToStationName('OFF'); // Matikan radio
        mp.game.audio.setUserRadioControlEnabled(false); // Nonaktifkan kontrol radio
    } else {
        mp.game.audio.setUserRadioControlEnabled(true); // Aktifkan kontrol radio
    }
});

// Event saat pemain masuk mobil
mp.events.add('playerEnterVehicle', (vehicle, seat) => {
    if (radioDisabled && seat === -1) { // Jika fitur dinonaktifkan dan pemain adalah pengemudi
        mp.game.audio.setRadioToStationName('OFF'); // Matikan radio
        mp.game.audio.setUserRadioControlEnabled(false); // Nonaktifkan kontrol radio
    }
});

// Event saat pemain keluar mobil
mp.events.add('playerLeaveVehicle', () => {
    if (!radioDisabled) {
        mp.game.audio.setUserRadioControlEnabled(true); // Aktifkan kembali kontrol radio
    }
});
