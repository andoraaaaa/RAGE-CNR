const database = require("../database");
const logUtil = require("../logUtil");
const config = require("../config");

mp.events.addCommand("tp", (player, _, x, y, z) => {
    if (player.isLoggedIn && player.admin > 0) {
        x = parseFloat(x);
        y = parseFloat(y);
        z = parseFloat(z);

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/tp [x] [y] [z]");
            return;
        }

        player.position = new mp.Vector3(x, y, z);
    }
});

mp.events.addCommand("tpwp", (player) => {
    if (player.isLoggedIn && player.admin > 0) {
        player.call("requestWaypointPosition");
    } else {
        player.outputChatBox("!{#FF8555}ERROR: !{#FFFFFF}Anda tidak memiliki izin untuk menggunakan command ini.");
    }
});

// Event handler untuk menerima posisi waypoint dari client
mp.events.add("sendWaypointPosition", (player, x, y, z) => {
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number' && x !== 0 && y !== 0) {
        player.position = new mp.Vector3(x, y, z);
        player.outputChatBox("!{#55FF55}Teleported to waypoint.");
    } else {
        player.outputChatBox("!{#FF8555}ERROR: !{#FFFFFF}Waypoint tidak ditemukan atau koordinat tidak valid.");
    }
});

mp.events.addCommand("agivemoney", (player, _, targetID, amount) => {
    if (player.isLoggedIn && player.admin > 0) {
        targetID = Number(targetID);
        amount = Number(amount);

        if (isNaN(targetID) || isNaN(amount)) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/agivemoney [player ID] [amount]");
            return;
        }

        let targetPlayer = mp.players.at(targetID);
        if (!targetPlayer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player not found.");
            return;
        }

        if (!targetPlayer.isLoggedIn) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player didn't log in.");
            return;
        }

        logUtil.igEventLog.info(`[AGIVEMONEY] ${player.name}(${player.id}) gave $${amount} to ${targetPlayer.name}(${targetPlayer.id}).`);
        targetPlayer.changeMoney(amount);
        targetPlayer.outputChatBox(`Admin ${player.name}(${player.id}) gave you !{#72CC72}$${amount}.`);
        player.outputChatBox(`Gave !{#72CC72}$${amount} !{#FFFFFF}to ${targetPlayer.name}(${targetPlayer.id}).`);

        if (config.dbLogging.adminActions) {
            database.pool.query("INSERT INTO log_admin SET AdminID=?, TargetID=?, Action='ACTION_GIVEMONEY', Details=?", [player.sqlID, targetPlayer.sqlID, amount]);
        }
    }
});

mp.events.addCommand("agiveweapon", (player, _, targetID, weaponName, ammo = 9999) => {
    if (player.isLoggedIn && player.admin > 0) {
        targetID = Number(targetID);
        ammo = Number(ammo);

        if (isNaN(targetID) || isNaN(ammo) || weaponName === undefined || weaponName.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/agiveweapon [player ID] [weapon name] [ammo (will be 9999 if not specified)]");
            return;
        }

        let targetPlayer = mp.players.at(targetID);
        if (!targetPlayer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player not found.");
            return;
        }

        if (!targetPlayer.isLoggedIn) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player didn't log in.");
            return;
        }

        logUtil.igEventLog.info(`[AGIVEWEAPON] ${player.name}(${player.id}) gave ${weaponName} with ${ammo} ammo to ${targetPlayer.name}(${targetPlayer.id}).`);
        targetPlayer.giveWeapon(mp.joaat(weaponName), ammo);
        targetPlayer.outputChatBox(`Admin ${player.name}(${player.id}) gave you ${weaponName} with ${ammo} ammo.`);
        player.outputChatBox(`Gave ${weaponName} with ${ammo} ammo to ${targetPlayer.name}(${targetPlayer.id}).`);

        if (config.dbLogging.adminActions) {
            database.pool.query("INSERT INTO log_admin SET AdminID=?, TargetID=?, Action='ACTION_GIVEWEAPON', Details=?", [player.sqlID, targetPlayer.sqlID, `Weapon: ${weaponName} | Ammo: ${ammo}`]);
        }
    }
});

mp.players.forEach((player) => {
    player.saveAccount = function () {
        const username = this.socialClub; // Assuming you store the username in socialClub
        const money = this.money; // Assuming you have a way to get the current money

        const query = "UPDATE accounts SET Money = ? WHERE Username = ?";
        database.pool.query(query, [money, username], (err) => {
            if (err) {
                console.error(`Error saving account for ${username}:`, err);
            } else {
                console.log(`Account for ${username} saved successfully.`);
            }
        });
    };
});


mp.events.addCommand("saveall", (player) => {
    if (player.isLoggedIn && player.admin > 0) {
        const connectedPlayers = mp.players.toArray(); // Get all connected players
        const totalPlayers = connectedPlayers.length;

        if (totalPlayers === 0) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}No players to save.");
            return;
        }

        let savedCount = 0;

        connectedPlayers.forEach((targetPlayer) => {
            if (targetPlayer.isLoggedIn) {
                targetPlayer.saveAccount(); // Call the function to save the account data
                savedCount++;
            }
        });

        player.outputChatBox(`!{#72CC72}SUCCESS: !{#FFFFFF}Saved ${savedCount} player(s) account data.`);
    } else {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You do not have permission to use this command.");
    }
});

//addveh
// Fungsi untuk menambahkan kendaraan baru ke database dan menambahkannya ke game
// Server-side
mp.events.addCommand("addveh", (player) => {
    if (!player.isLoggedIn) {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You need to be logged in to add a vehicle.");
        return;
    }

    // Cek apakah pemain berada di dalam kendaraan
    const vehicle = player.vehicle;
    if (!vehicle) {
        player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You must be inside a vehicle to use this command.");
        return;
    }

    // Panggil event di client-side untuk mendapatkan nama model kendaraan
    player.call("vspawner_getVehicleModel", [vehicle]);
});

// Event server untuk menambah kendaraan ke database dengan nama model dari client-side
mp.events.add("server_addVehicleToDB", (player, modelName) => {
    const vehicle = player.vehicle;
    const position = vehicle.position;
    const rotationZ = vehicle.rotation.z;

    // Warna default kendaraan menjadi hijau tua
    const defaultColor1 = 0;   // Ganti dengan kode warna yang sesuai jika perlu
    const defaultColor2 = 100;  // Kode warna hijau tua

    // Simpan kendaraan ke database
    database.pool.query(
        "INSERT INTO vehicles (model, position_x, position_y, position_z, rotation_z, color1, color2, spawnedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [modelName, position.x, position.y, position.z, rotationZ, defaultColor1, defaultColor2, player.sqlID],
        (error, result) => {
            if (error) {
                console.error(`Failed to save vehicle to database: ${error.message}`);
                player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Failed to save vehicle.");
                return;
            }

            player.outputChatBox(`Vehicle ${modelName} added successfully at your current location!`);
        }
    );
});

// Tambahkan ini di dalam commands.js di folder packages

// Tambahkan ini di dalam commands.js di folder packages

mp.events.addCommand('cveh', (player, fullText, vehicleName) => {
    // Cek apakah pemain adalah admin (level admin lebih besar dari 0)
    if (player.admin <= 0) {
        return player.outputChatBox("Anda tidak memiliki izin untuk menggunakan command ini.");
    }

    // Cek apakah nama kendaraan diberikan
    if (!vehicleName) {
        return player.outputChatBox("Gunakan: /cveh [nama_kendaraan]");
    }

    // Posisi spawn kendaraan di tempat pemain saat ini
    const spawnPos = player.position;

    try {
        // Spawn kendaraan berdasarkan nama di posisi pemain saat ini
        const vehicle = mp.vehicles.new(mp.joaat(vehicleName), spawnPos, {
            heading: player.heading,
            dimension: player.dimension
        });

        // Berikan sedikit delay sebelum pemain masuk ke kendaraan untuk memastikan kendaraan sudah terbuat sepenuhnya
        setTimeout(() => {
            player.putIntoVehicle(vehicle, 0); // Masukkan pemain ke kendaraan di kursi pengemudi
        }, 250); // Delay 250 ms

        player.outputChatBox(`Kendaraan ${vehicleName} berhasil di-spawn.`);
    } catch (error) {
        player.outputChatBox("Nama kendaraan tidak valid atau terjadi kesalahan saat spawn kendaraan.");
    }
});



mp.events.addCommand("kick", (player, _, targetID, ...reason) => {
    if (player.isLoggedIn && player.admin > 0) {
        targetID = Number(targetID);
        reason = reason.join(' ');

        if (isNaN(targetID) || reason === undefined || reason.length < 1) {
            player.outputChatBox("!{#FF8555}SYNTAX: !{#FFFFFF}/kick [player ID] [reason]");
            return;
        }

        if (player.id === targetID) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't kick yourself.");
            return;
        }

        let targetPlayer = mp.players.at(targetID);
        if (!targetPlayer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player not found.");
            return;
        }

        if (!targetPlayer.isLoggedIn) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}Player didn't log in.");
            return;
        }

        logUtil.igEventLog.info(`[KICK] ${player.name}(${player.id}) kicked ${targetPlayer.name}(${targetPlayer.id}) with reason ${reason}.`);
        mp.players.broadcast(`!{#FF8555}KICK: !{FFFFFF}${targetPlayer.name}(${targetPlayer.id}) has been kicked by ${player.name}(${player.id}). (${reason})`);
        player.outputChatBox(`Kicked ${targetPlayer.name}.`);
        targetPlayer.kick();

        if (config.dbLogging.adminActions) {
            database.pool.query("INSERT INTO log_admin SET AdminID=?, TargetID=?, Action='ACTION_KICK', Details=?", [player.sqlID, targetPlayer.sqlID, `Reason: ${reason}`]);
        }
    }
});