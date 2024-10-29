
// Client-Side Code
let isCuffed = false;

// Event to start the cuff animation and set cuffed status
mp.events.add("playCuffAnimation", () => {
    isCuffed = true;

    // Load and play the cuff animation
    mp.game.streaming.requestAnimDict("mp_arresting");
    const interval = setInterval(() => {
        if (mp.game.streaming.hasAnimDictLoaded("mp_arresting")) {
            mp.players.local.taskPlayAnim("mp_arresting", "idle", 8.0, 1.0, -1, 49, 0, false, false, false);
            clearInterval(interval);
        }
    }, 100);
});

// Event to stop the cuff animation and reset cuffed status
mp.events.add("stopCuffAnimation", () => {
    isCuffed = false;
    mp.players.local.stopAnimTask("mp_arresting", "idle", 3);
    mp.players.local.setCanSwitchWeapon(true); // Re-enable weapon switching when uncuffed
});

// Monitor if the player is cuffed and disable weapon actions if true
mp.events.add("render", () => {
    if (isCuffed) {
        // Prevent weapon switching
        mp.players.local.setCanSwitchWeapon(false);

        // If player has a weapon equipped, set them to unarmed
        if (mp.players.local.weapon !== mp.game.joaat("weapon_unarmed")) {
            mp.players.local.giveWeapon(mp.game.joaat("weapon_unarmed"), 0, true); // Set to unarmed
        }

        // Disable shooting controls
        mp.game.controls.disableControlAction(0, 24, true); // Disable Attack
        mp.game.controls.disableControlAction(0, 25, true); // Disable Aim
        mp.game.controls.disableControlAction(0, 140, true); // Disable Melee Attack Light
        mp.game.controls.disableControlAction(0, 141, true); // Disable Melee Attack Heavy
        mp.game.controls.disableControlAction(0, 142, true); // Disable Melee Attack Alternate
    }
});