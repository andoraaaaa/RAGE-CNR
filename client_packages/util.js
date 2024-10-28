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

// Initialize resolution and aspectRatio if not set
sharedDrawingVariables.resolution = sharedDrawingVariables.resolution || { x: 1920, y: 1080 }; // Example resolution
sharedDrawingVariables.aspectRatio = sharedDrawingVariables.aspectRatio || (sharedDrawingVariables.resolution.x / sharedDrawingVariables.resolution.y);
sharedDrawingVariables.safeZoneSize = sharedDrawingVariables.safeZoneSize || 1.0; // Default safe zone

const ui = mp.game.ui;

// Function to draw text on screen
exports.drawText = function(text, position, scale, font = 4, color = [255, 255, 255, 255], alignment = 0, outline = true) {
    ui.setTextEntry("CELL_EMAIL_BCON");
    
    // Split text into chunks of 99 characters
    for (let i = 0; i < text.length; i += 99) {
        ui.addTextComponentSubstringPlayerName(text.substr(i, Math.min(99, text.length - i)));
    }

    ui.setTextFont(font);
    ui.setTextScale(scale, scale);
    ui.setTextColour(color[0], color[1], color[2], color[3]);
    
    if (outline) {
        mp.game.invoke("0x2513DFB0FB8400FE"); // SET_TEXT_OUTLINE
    }

    // Set text alignment based on the alignment parameter
    switch (alignment) {
        case 1:
            ui.setTextCentre(true);
            break;
        case 2:
            ui.setTextRightJustify(true);
            ui.setTextWrap(0, position[0]);
            break;
    }

    ui.drawText(position[0], position[1]);
};

// Function to get minimap anchor based on safe zone and resolution
exports.getMinimapAnchor = function() {
    // Check if sharedDrawingVariables.resolution is defined
    if (!sharedDrawingVariables.resolution || !sharedDrawingVariables.aspectRatio) {
        console.error("Resolution or aspect ratio is not defined.");
        return null; // Or return a default value as necessary
    }

    let resolution = sharedDrawingVariables.resolution;
    let sfX = 1.0 / 20.0;
    let sfY = 1.0 / 20.0;
    let scaleX = 1.0 / resolution.x;
    let scaleY = 1.0 / resolution.y;

    let minimap = {
        width: scaleX * (resolution.x / (4 * sharedDrawingVariables.aspectRatio)),
        height: scaleY * (resolution.y / 5.674),
        scaleX: scaleX,
        scaleY: scaleY,
        leftX: scaleX * (resolution.x * (sfX * (Math.abs(sharedDrawingVariables.safeZoneSize - 1.0) * 10))),
        bottomY: 1.0 - scaleY * (resolution.y * (sfY * (Math.abs(sharedDrawingVariables.safeZoneSize - 1.0) * 10))),
    };

    minimap.rightX = minimap.leftX + minimap.width;
    minimap.topY = minimap.bottomY - minimap.height;
    return minimap;
};

// Load a texture dictionary if it is not already loaded
exports.loadTextureDict = function(textureDictName) {
    if (!mp.game.graphics.hasStreamedTextureDictLoaded(textureDictName)) {
        mp.game.graphics.requestStreamedTextureDict(textureDictName, true);
        
        // Wait until the texture dictionary is loaded or timeout after 500 ms
        let start = Date.now();
        while (!mp.game.graphics.hasStreamedTextureDictLoaded(textureDictName) && (Date.now() - start) < 500) {
            mp.game.wait(0);
        }
    }
};

// Load a clip set if it is not already loaded
exports.loadClipSet = function(clipSetName) {
    if (!mp.game.streaming.hasClipSetLoaded(clipSetName)) {
        mp.game.streaming.requestClipSet(clipSetName);
        
        // Wait until the clip set is loaded or timeout after 500 ms
        let start = Date.now();
        while (!mp.game.streaming.hasClipSetLoaded(clipSetName) && (Date.now() - start) < 500) {
            mp.game.wait(0);
        }
    }
};

// Get the width of the text based on the font and scale
exports.getTextWidth = (text, font, scale) => {
    ui.setTextEntryForWidth("STRING");
    ui.addTextComponentSubstringPlayerName(text);
    ui.setTextFont(font);
    ui.setTextScale(scale * 1.25, scale);
    return ui.getTextScreenWidth(true);
};
