mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("spawnProtection")) {
        entity.setInvincible(true);
    }
});

mp.events.addDataHandler("spawnProtection", (entity, value) => {
    if (entity.type === "player") entity.setInvincible(value === true);
});