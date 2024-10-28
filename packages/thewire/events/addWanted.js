// Import team data
const teamData = require('../data/teamData.json');
// Event saat pemain memasuki kendaraan

// Event saat pemain memasuki kendaraan
mp.events.add("playerEnterVehicle", (player, vehicle, seat) => {
    if (seat === 0) {
        const vehicleModel = 'emperor';
        console.log(`Player ${player.name} entered a vehicle with model: ${vehicleModel}`);

        // Check if the vehicle model is an Emperor
        const emperorHash = -1975721230;
        if (vehicleModel === emperorHash) {
            addWantedLevel(player, 3); // Add 3 to wanted level
        } else {
            player.outputChatBox("This vehicle does not increase your wanted level.");
        }
    }
});


