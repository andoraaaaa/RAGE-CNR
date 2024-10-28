const relationshipNames = {
    Player: "PLAYER",
    Default: "RG_PLAYER_NEUTRAL",
    SameTeam: "RG_PLAYER_TEAMMATE"
};

const relationshipTypes = {
    Companion: 0,
    Respect: 1,
    Like: 2,
    Neutral: 3,
    Dislike: 4,
    Hate: 5,
    Pedestrians: 255
};

const defaultTeamHash = mp.game.joaat(relationshipNames.Default);
const sameTeamHash = mp.game.joaat(relationshipNames.SameTeam);

// just in case
mp.players.local.setRelationshipGroupHash(mp.game.joaat(relationshipNames.Player));

// create relationship groups
mp.game.ped.addRelationshipGroup(relationshipNames.Default, 0);
mp.game.ped.addRelationshipGroup(relationshipNames.SameTeam, 0);

// set relationships
mp.game.ped.setRelationshipBetweenGroups(relationshipTypes.Companion, mp.game.joaat(relationshipNames.Player), mp.game.joaat(relationshipNames.SameTeam));
mp.game.ped.setRelationshipBetweenGroups(relationshipTypes.Hate, mp.game.joaat(relationshipNames.Player), mp.game.joaat(relationshipNames.Default));

mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player") {
        let entityTeam = entity.getVariable("currentTeam");
        entity.setRelationshipGroupHash((entityTeam != null && entityTeam === mp.players.local.getVariable("currentTeam")) ? sameTeamHash : defaultTeamHash);
    }
});

mp.events.addDataHandler("currentTeam", (entity, value) => {
    if (entity.type !== "player" || !entity.handle) return;

    if (entity.handle === mp.players.local.handle) {
        if (value != null) {
            mp.players.forEachInStreamRange((player) => {
                if (player.handle !== mp.players.local.handle) {
                    let playerTeam = player.getVariable("currentTeam");
                    player.setRelationshipGroupHash((playerTeam != null && playerTeam === value) ? sameTeamHash : defaultTeamHash);
                }
            });
        } else {
            mp.players.forEachInStreamRange((player) => {
                if (player.handle !== mp.players.local.handle) player.setRelationshipGroupHash(defaultTeamHash);
            });
        }
    } else {
        entity.setRelationshipGroupHash((value != null && mp.players.local.getVariable("currentTeam") === value) ? sameTeamHash : defaultTeamHash);
    }
});