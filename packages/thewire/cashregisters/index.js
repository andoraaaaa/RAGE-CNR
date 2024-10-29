const database = require("../database");
const { minShotReward, maxShotReward, minEmptyReward, maxEmptyReward, cashLife } = require("./json/config");
const { cashRegisterState, CashRegister } = require("./classes/CashRegister");
const { UUID, getRandomArbitrary, getRandomInt, distanceVector } = require("./util");
const cashRegisterData = require("./json/cashRegisters");
const cashRegisters = {};

// Create cash registers
for (const item of cashRegisterData) {
    const uuid = UUID();
    cashRegisters[uuid] = new CashRegister(uuid, item.position, item.heading);
}

// Penambahan metode changeMoney ke objek player
mp.players.forEach((player) => {
    player.changeMoney = function(amount) {
        this.money += amount; // Tambah uang ke saldo pemain
        this.outputChatBox(`You received $${amount}. Your new balance is $${this.money}.`);
        
        // Jika Anda ingin memperbarui saldo di database, panggil fungsi di sini
        updatePlayerMoneyInDatabase(this, amount); // Memperbarui saldo di database
    };
});

// Helper function to update Money in the database by adding the amount
function updatePlayerMoneyInDatabase(player, amount) {
    const username = player.accountName; // Ambil username dari objek player
    const query = "UPDATE accounts SET Money = Money + ? WHERE Username = ?";
    
    // Log query dengan parameter
    console.log(`Executing query: ${query}`);
    console.log(`With parameters: Money = ${amount}, Username = ${username}`);

    database.pool.query(query, [amount, username], (err) => {
        if (err) {
            console.error("Error updating player money in database:", err);
        } else {
            console.log("Database updated successfully.");
        }
    });
}

// Function to add to the player's wanted level
function addWantedLevel(player, amount) {
    // Validate the player object
    if (!player || !player.data || !player.accountName) {
        console.error("Invalid player object.");
        return;
    }

    // Ensure the amount is a number
    if (typeof amount !== 'number' || amount <= 0) {
        console.error("Invalid amount for wanted level.");
        return;
    }

    // Query to get the current wanted level from the database
    const query = "SELECT wanted FROM accounts WHERE Username = ?";
    database.pool.query(query, [player.accountName], (error, results) => {
        if (error) {
            console.error("Error retrieving wanted level:", error);
            player.outputChatBox("An error occurred while retrieving your wanted level.");
            return;
        }

        if (results.length === 0) {
            console.error("No account found for this player.");
            player.outputChatBox("No account found.");
            return;
        }

        // Get the current wanted level from the database and ensure it's a number
        const currentWantedLevel = Number(results[0].wanted); // Convert to number

        // Increment the wanted level
        const newWantedLevel = currentWantedLevel + amount;

        // Update in memory
        player.data.wanted = newWantedLevel;

        // Update the database
        const updateQuery = "UPDATE accounts SET wanted = ? WHERE Username = ?";
        database.pool.query(updateQuery, [newWantedLevel, player.accountName], (updateError) => {
            if (updateError) {
                console.error("Error updating wanted level:", updateError);
                player.outputChatBox("An error occurred while updating your wanted level.");
                return;
            }

            player.outputChatBox(`Your wanted level has increased by !{#FF0000}${amount} !{#FFFFFF}and is now: !{#FF0000}${newWantedLevel}`);
            player.call("showPictureNotification", ["Robbery News", "", `Your wanted level is now "${newWantedLevel}" carefull for the cops!`, "CHAR_CALL911"]);
        });
    });
}



// Update in playerEnterColshape
mp.events.add("playerEnterColshape", (player, colshape) => {
    if (colshape.cashAmount) {
        player.changeCurrency("cash", colshape.cashAmount);
        player.changeMoney(colshape.cashAmount); // Gunakan metode changeMoney untuk menambah uang

        player.outputChatBox(`Got !{#72CC72}$${colshape.cashAmount} !{#FFFFFF}from the cash register. (shot)`);
        addWantedLevel(player, 6)

        if (colshape.timer) {
            clearTimeout(colshape.timer);
            colshape.timer = null;
        }

        if (colshape.cashProp && mp.objects.exists(colshape.cashProp)) {
            colshape.cashProp.destroy();
            colshape.cashProp = null;
        }

        if (colshape.cashLabel && mp.labels.exists(colshape.cashLabel)) {
            colshape.cashLabel.destroy();
            colshape.cashLabel = null;
        }

        colshape.destroy();
        return;
    }

    if (colshape.cashRegisterId && cashRegisters[colshape.cashRegisterId] && cashRegisters[colshape.cashRegisterId].state === cashRegisterState.normal) {
        player.setOwnVariable("nearCashRegisterId", colshape.cashRegisterId);
    }
});

mp.events.add("playerExitColshape", (player, colshape) => {
    if (colshape.cashRegisterId) {
        player.setOwnVariable("nearCashRegisterId", null);
    }
});

// Script events
mp.events.add("cashRegisters::shot", (player, cashRegisterId, dropPos) => {
    const cashRegister = cashRegisters[cashRegisterId];
    if (!cashRegister || cashRegister.state !== cashRegisterState.normal) {
        return;
    }

    dropPos = JSON.parse(dropPos);
    if (distanceVector(cashRegister.position, dropPos) >= 3.0) {
        return;
    }

    cashRegister.setState(cashRegisterState.shot);

    // Create cash "pickup"
    const cashArea = mp.colshapes.newSphere(dropPos.x, dropPos.y, dropPos.z, 1.0);
    cashArea.cashAmount = getRandomInt(minShotReward, maxShotReward);

    cashArea.cashProp = mp.objects.new("prop_cash_pile_01", new mp.Vector3(dropPos.x, dropPos.y, dropPos.z - 0.2), {
        rotation: new mp.Vector3(0.0, 0.0, getRandomArbitrary(-360.0, 360.0))
    });

    cashArea.cashLabel = mp.labels.new(`$${cashArea.cashAmount}`, dropPos, {
        los: false,
        font: 0,
        drawDistance: 10.0,
        color: [114, 204, 114, 255]
    });

    cashArea.timer = setTimeout(() => {
        cashArea.timer = null;

        if (cashArea.cashProp && mp.objects.exists(cashArea.cashProp)) {
            cashArea.cashProp.destroy();
            cashArea.cashProp = null;
        }

        if (cashArea.cashLabel && mp.labels.exists(cashArea.cashLabel)) {
            cashArea.cashLabel.destroy();
            cashArea.cashLabel = null;
        }

        if (mp.colshapes.exists(cashArea)) {
            cashArea.destroy();
        }
    }, cashLife);
});

// Update in cashRegisters::empty
mp.events.add("cashRegisters::empty", (player) => {
    const cashRegister = cashRegisters[player.getOwnVariable("nearCashRegisterId")];
    if (!cashRegister || cashRegister.state !== cashRegisterState.normal) {
        return;
    }

    cashRegister.setState(cashRegisterState.emptied);

    const amount = getRandomInt(minEmptyReward, maxEmptyReward);
    player.changeCurrency("cash", amount);
    player.changeMoney(amount); // Gunakan metode changeMoney untuk menambah uang
    player.outputChatBox(`Got $${amount} from the cash register. (emptied)`);
    player.saveAccount();
});
