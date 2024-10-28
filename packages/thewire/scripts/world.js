const config = require("../config");

let time = config.world.time;

module.exports.init = function() {
    mp.world.weather = config.world.weather;
    mp.world.time.set(time.hour, time.minute, time.second);

    setInterval(() => {
        time.second++;

        if (time.second >= 60) {
            time.second = 0;
            time.minute++;

            if (time.minute >= 60) {
                time.minute = 0;
                time.hour++;

                if (time.hour >= 24) time.hour = 0;
            }
        }

        mp.world.time.set(time.hour, time.minute, time.second);
    }, 1000);
};