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

var sharedDrawingVariables = new Proxy({}, {
    set: function(target, property, value) {
        let current = target[property];
        target[property] = value;

        mp.events.call("onDrawingVariableChange", property, current, value);
        return true;
    }
});
const firingModes = {
    Auto: 0,
    Burst: 1,
    Single: 2,
    Safe: 3
};

const firingModeNames = ["Auto", "Burst", "Single", "Safe"];

// weapons in these groups are completely ignored
const ignoredWeaponGroups = [
    mp.game.joaat("GROUP_UNARMED"), mp.game.joaat("GROUP_MELEE"), mp.game.joaat("GROUP_FIREEXTINGUISHER"), mp.game.joaat("GROUP_PARACHUTE"), mp.game.joaat("GROUP_STUNGUN"),
    mp.game.joaat("GROUP_THROWN"), mp.game.joaat("GROUP_PETROLCAN"), mp.game.joaat("GROUP_DIGISCANNER"), mp.game.joaat("GROUP_HEAVY")
];

// if a weapon's group is already in burstFireAllowedGroups, don't put it here
const burstFireAllowedWeapons = [ mp.game.joaat("WEAPON_APPISTOL") ];
const burstFireAllowedGroups = [ mp.game.joaat("GROUP_SMG"), mp.game.joaat("GROUP_MG"), mp.game.joaat("GROUP_RIFLE") ];

// weapons in here are not able to use single fire mode
const singleFireBlacklist = [
    mp.game.joaat("WEAPON_STUNGUN"), mp.game.joaat("WEAPON_FLAREGUN"), mp.game.joaat("WEAPON_MARKSMANPISTOL"), mp.game.joaat("WEAPON_REVOLVER"), mp.game.joaat("WEAPON_REVOLVER_MK2"),
    mp.game.joaat("WEAPON_DOUBLEACTION"), mp.game.joaat("WEAPON_PUMPSHOTGUN"), mp.game.joaat("WEAPON_PUMPSHOTGUN_MK2"), mp.game.joaat("WEAPON_SAWNOFFSHOTGUN"), mp.game.joaat("WEAPON_BULLPUPSHOTGUN"),
    mp.game.joaat("WEAPON_MUSKET"), mp.game.joaat("WEAPON_DBSHOTGUN"), mp.game.joaat("WEAPON_SNIPERRIFLE"), mp.game.joaat("WEAPON_HEAVYSNIPER"), mp.game.joaat("WEAPON_HEAVYSNIPER_MK2")
];

function isWeaponIgnored(weaponHash) {
    return ignoredWeaponGroups.indexOf(mp.game.weapon.getWeapontypeGroup(weaponHash)) > -1;
}

function canWeaponUseBurstFire(weaponHash) {
    return burstFireAllowedGroups.indexOf(mp.game.weapon.getWeapontypeGroup(weaponHash)) > -1 ? true : (burstFireAllowedWeapons.indexOf(weaponHash) > -1);
}

function canWeaponUseSingleFire(weaponHash) {
    return singleFireBlacklist.indexOf(weaponHash) == -1;
}

let currentWeapon = sharedVariables.localPlayer.weapon;
let ignoreCurrentWeapon = isWeaponIgnored(currentWeapon);
let weaponConfig = {};

let curFiringMode = 0;
let curBurstShots = 0;

mp.events.add("render", () => {
    if (sharedVariables.localPlayer.weapon != currentWeapon) {
        currentWeapon = sharedVariables.localPlayer.weapon;
        ignoreCurrentWeapon = isWeaponIgnored(currentWeapon);

        curFiringMode = weaponConfig[currentWeapon] === undefined ? firingModes.Auto : weaponConfig[currentWeapon];
        curBurstShots = 0;

        sharedVariables.drawFiringMode = !ignoreCurrentWeapon;
        sharedVariables.firingModeText = `Firing Mode (F6): ${firingModeNames[curFiringMode]}`;
    }

    if (ignoreCurrentWeapon) return;

    if (curFiringMode != firingModes.Auto) {
        if (curFiringMode == firingModes.Burst) {
            // handle burst fire
            if (sharedVariables.localPlayer.isShooting()) curBurstShots++;
            if (curBurstShots > 0 && curBurstShots < 3) mp.game.controls.setControlNormal(0, 24, 1.0);

            if (curBurstShots == 3) {
                mp.game.player.disableFiring(false);
                if (mp.game.controls.isDisabledControlJustReleased(0, 24)) curBurstShots = 0;
            }

            if (sharedVariables.localPlayer.isReloading()) curBurstShots = 0;
        } else if (curFiringMode == firingModes.Single) {
            // handle single fire
            if (mp.game.controls.isDisabledControlPressed(0, 24)) mp.game.player.disableFiring(false);
        } else if (curFiringMode == firingModes.Safe) {
            // handle safe
            mp.game.player.disableFiring(false);
            if (mp.game.controls.isDisabledControlJustPressed(0, 24)) mp.game.audio.playSoundFrontend(-1, "Faster_Click", "RESPAWN_ONLINE_SOUNDSET", true);
        }
    }
});

// F6 - change firing mode
mp.keys.bind(0x75, false, () => {
    if (!ignoreCurrentWeapon) {
        let newFiringMode = curFiringMode + 1;
        if (newFiringMode > firingModes.Safe) newFiringMode = firingModes.Auto;

        if (newFiringMode == firingModes.Burst) {
            // switched to burst, check if weapon supports burst fire. if not, skip to safe
            if (!canWeaponUseBurstFire(currentWeapon)) newFiringMode = canWeaponUseSingleFire(currentWeapon) ? firingModes.Single : firingModes.Safe;
        } else if (newFiringMode == firingModes.Single) {
            // switched to single, check if weapon supports single fire. if not, skip to safe
            if (!canWeaponUseSingleFire(currentWeapon)) newFiringMode = firingModes.Safe;
        }

        if (curFiringMode != newFiringMode) {
            curFiringMode = newFiringMode;
            curBurstShots = 0;
            sharedVariables.firingModeText = `Firing Mode (F6): ${firingModeNames[curFiringMode]}`;

            mp.game.audio.playSoundFrontend(-1, "Faster_Click", "RESPAWN_ONLINE_SOUNDSET", true);
            weaponConfig[currentWeapon] = curFiringMode;
        }
    }
});