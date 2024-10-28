const util = require("util");

const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.25;

util.loadClipSet(movementClipSet);
util.loadClipSet(strafeClipSet);

mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("isCrouched")) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    }
});

mp.events.addDataHandler("isCrouched", (entity, value) => {
    if (entity.type === "player") {
        if (value) {
            entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
            entity.setStrafeClipset(strafeClipSet);
        } else {
            entity.resetMovementClipset(clipSetSwitchTime);
            entity.resetStrafeClipset();
        }
    }
});

// CTRL - toggle crouching
mp.keys.bind(0x11, false, () => {
    mp.events.callRemote("toggleCrouch");
});