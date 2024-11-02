let bankAmount = 0;
let cashAmount = 0;
let moneyTextdraw; // Define your textdraw object
let textDrawVisible = false; // Track visibility of the textdraw

// Function to draw money display
function drawMoneyDisplay() {
    if (textDrawVisible) {
        // Draw bank amount
        mp.game.graphics.drawText("BANK", [0.95, 0.05], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.5, 0.5],
            outline: true,
            align: 1
        });

        mp.game.graphics.drawText(`$${bankAmount}`, [0.95, 0.08], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.5, 0.5],
            outline: true,
            align: 1
        });

        // Draw cash amount
        mp.game.graphics.drawText("CASH", [0.95, 0.11], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.5, 0.5],
            outline: true,
            align: 1
        });

        mp.game.graphics.drawText(`$${cashAmount}`, [0.95, 0.14], {
            font: 4,
            color: [50, 205, 50, 255], // Green color for cash
            scale: [0.5, 0.5],
            outline: true,
            align: 1
        });
    }
}

// Function to show the textdraw for a limited time
function showTextdrawForLimitedTime(duration) {
    textDrawVisible = true; // Set visibility to true
    setTimeout(() => {
        textDrawVisible = false; // Hide after duration
    }, duration);
}

// Listen for the money data received from the server
mp.events.add("receiveMoneyData", (money, bank) => {
    cashAmount = money; // Update cash amount
    bankAmount = bank;   // Update bank amount

    // Log the updated values for debugging
    console.log(`Money updated: Cash = $${cashAmount}, Bank = $${bankAmount}`);

    // Show textdraw for 5 seconds
    showTextdrawForLimitedTime(5000);

    // Call the display function to update the UI
    drawMoneyDisplay();
});

// Function to update TextDraw with the current cash amount
mp.events.add("updateMoneyTextdraw", (player) => {
    // Assuming you have a textdraw object defined
    showTextdrawForLimitedTime(5000);
    drawMoneyDisplay();
});

// Request money data when the player spawns
mp.events.add('playerSpawn', () => {
    mp.events.callRemote("requestMoneyData"); // Request the money data from the server

    // Show textdraw for 5 seconds after spawn
    showTextdrawForLimitedTime(5000); // Show textdraw for 5 seconds

    // Draw the display continuously
    mp.events.add('render', () => {
        drawMoneyDisplay(); // Draw the display using the current bankAmount and cashAmount
    });
});
