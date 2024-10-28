const turfs = require("../scripts/turfs").turfs;
const teamData = require("../data/teamData");
const config = require("../config");
const util = require("../util");

mp.events.add("playerEnterColshape", (player, colShape) => {
    if (player.isLoggedIn && colShape.turfID) {
        if (player.spawnProtectionTimer) {
            player.outputChatBox("!{#E03232}ERROR: !{#FFFFFF}You can't interact with turfs while spawn protection is active.");
            return;
        }

        let turfID = colShape.turfID;
        if (player.data.currentTeam !== turfs[turfID].ownerTeam) {
            let turf = turfs[turfID];

            if (turf.capturingTeam) {
                if (turf.capturingTeam === player.data.currentTeam) {
                    player.attackingTurf = turfID;
                } else {
                    player.outputChatBox(`This turf is being captured by !{${teamData[turf.capturingTeam].ColorHex}}${teamData[turf.capturingTeam].Name}.`);
                }
            } else {
                player.attackingTurf = turfID;
                turf.capturingTeam = player.data.currentTeam;
                turf.captureProgress = 0;

                if (turf.ownerTeam) {
                    util.getPlayersOfTeam(turf.ownerTeam).forEach((p) => {
                        p.call("showPictureNotification", [
                            "Turf under attack!",
                            "",
                            `Our turf "${turf.name}" is being captured by ~${teamData[turf.capturingTeam].ColorName}~${teamData[turf.capturingTeam].Name}.`,
                            "DIA_GOON"
                        ]);
                    });
                }

                turf.captureTimer = setInterval(() => {
                    let attackers = mp.players.toArray().filter(p => p.health > 0 && p.data.currentTeam === turf.capturingTeam && p.attackingTurf === turfID);

                    if (attackers.length > 0) {
                        turf.captureProgress += attackers.length > config.turfCaptureMaxProgressIncrease ? config.turfCaptureMaxProgressIncrease : attackers.length;

                        if (turf.captureProgress >= config.turfCaptureRequiredProgress) {
                            if (turf.ownerTeam) {
                                util.getPlayersOfTeam(turf.ownerTeam).forEach((p) => {
                                    p.call("showPictureNotification", [
                                        "Turf lost!",
                                        "",
                                        `Our turf "${turf.name}" got captured by ~${teamData[turf.capturingTeam].ColorName}~${teamData[turf.capturingTeam].Name}.`,
                                        "DIA_GOON"
                                    ]);
                                });
                            }

                            util.getPlayersOfTeam(turf.capturingTeam).forEach((p) => {
                                p.call("showPictureNotification", [
                                    "Turf acquired!",
                                    "",
                                    `We captured "${turf.name}".`,
                                    "DIA_GOON"
                                ]);
                            });

                            clearInterval(turf.captureTimer);
                            turf.captureTimer = undefined;

                            turf.ownerTeam = turf.capturingTeam;
                            turf.capturingTeam = undefined;
                            turf.captureProgress = 0;

                            // if (turfArea.blip) turf.areaBlip.color = teamData[turf.ownerTeam].BlipColor; -- todo: uncomment after 0.4
                            if (turf.blip) turf.blip.color = teamData[turf.ownerTeam].BlipColor;

                            attackers.forEach((attacker) => attacker.call("hideTurfInfo"));
                        } else {
                            attackers.forEach((attacker) => attacker.call("setTurfInfo", [turf.name, turf.captureProgress, config.turfCaptureRequiredProgress]));
                        }
                    } else {
                        if (turf.ownerTeam) {
                            util.getPlayersOfTeam(turf.ownerTeam).forEach((p) => {
                                p.call("showPictureNotification", [
                                    "Turf defended!",
                                    "",
                                    `Our turf "${turf.name}" was being captured by ~${teamData[turf.capturingTeam].ColorName}~${teamData[turf.capturingTeam].Name} ~w~but they got defeated.`,
                                    "DIA_GOON"
                                ]);
                            });
                        }

                        clearInterval(turf.captureTimer);
                        turf.captureTimer = undefined;

                        turf.capturingTeam = undefined;
                        turf.captureProgress = 0;
                    }
                }, 1000);
            }
        }
    }
});

mp.events.add("playerExitColshape", (player, colShape) => {
    if (colShape.turfID && player.attackingTurf === colShape.turfID) {
        player.attackingTurf = undefined;
        player.call("hideTurfInfo");
    }
});