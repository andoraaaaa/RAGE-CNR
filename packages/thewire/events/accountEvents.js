const bcrypt = require("bcryptjs");
const dateFns = require("date-fns");
const database = require("../database");
const logUtil = require("../logUtil");
const config = require("../config");

// Helper function to update Money in the database by adding or subtracting the amount
function updatePlayerMoneyInDatabase(player, amount, incrementStoreRobbed = false) {
    const username = player.accountName;

    // Determine if the amount is positive or negative for the query
    const query = incrementStoreRobbed 
        ? "UPDATE accounts SET Money = Money + ?, storeRobbed = storeRobbed + 1 WHERE Username = ?"
        : "UPDATE accounts SET Money = Money + ? WHERE Username = ?";

    // Execute the database query
    database.pool.query(query, [amount, username], (err) => {
        if (err) {
            console.error("Error updating player money in database:", err);
        } else {
            console.log(`Database updated successfully for ${username}. Current adjustment: $${amount}.`);
        }
    });
}

// Function to add to the player's wanted level
function addWantedLevel(player, amount) {
    // Validate the player object
    if (!player || !player.data || !player.accountName) {
        console.error("Invalid player object.");
        return;
    }

    // Ensure the amount is a number
    if (typeof amount !== 'number' || amount <= 0) {
        console.error("Invalid amount for wanted level.");
        return;
    }

    // Query to get the current wanted level from the database
    const query = "SELECT wanted FROM accounts WHERE Username = ?";
    database.pool.query(query, [player.accountName], (error, results) => {
        if (error) {
            console.error("Error retrieving wanted level:", error);
            player.outputChatBox("An error occurred while retrieving your wanted level.");
            return;
        }

        if (results.length === 0) {
            console.error("No account found for this player.");
            player.outputChatBox("No account found.");
            return;
        }

        // Get the current wanted level from the database and ensure it's a number
        const currentWantedLevel = Number(results[0].wanted); // Convert to number

        // Increment the wanted level
        const newWantedLevel = currentWantedLevel + amount;

        // Update in memory
        player.data.wanted = newWantedLevel;

        // Update the database
        const updateQuery = "UPDATE accounts SET wanted = ? WHERE Username = ?";
        database.pool.query(updateQuery, [newWantedLevel, player.accountName], (updateError) => {
            if (updateError) {
                console.error("Error updating wanted level:", updateError);
                player.outputChatBox("An error occurred while updating your wanted level.");
                return;
            }

            player.outputChatBox(`Your wanted level has increased by !{#FF0000}${amount} !{#FFFFFF}and is now: !{#FF0000}${newWantedLevel}`);
            player.call("showPictureNotification", ["Robbery News", "", `Your wanted level is now "${newWantedLevel}" carefull for the cops!`, "CHAR_CALL911"]);
        });
    });
}

module.exports = {
    updatePlayerMoneyInDatabase,
    addWantedLevel
};

// Helper function to update Money in the database by adding the amount
function updatePlayerMoneyInDatabase(player, amount, incrementStoreRobbed = false) {
    const username = player.accountName;

    const query = incrementStoreRobbed 
        ? "UPDATE accounts SET Money = Money + ?, storeRobbed = storeRobbed + 1 WHERE Username = ?"
        : "UPDATE accounts SET Money = Money + ? WHERE Username = ?";

    database.pool.query(query, [amount, username], (err) => {
        if (err) {
            console.error("Error updating player money in database:", err);
        } else {
            console.log(`Database updated successfully for ${username}. Current adjustment: +$${amount}.`);
            // Refresh the money textdraw
            refreshMoneyTextdraw(player);
        }
    });
}


function refreshMoneyTextdraw(player) {
    player.call("updateMoneyTextdraw", [currentMoney]);
}


mp.events.add("requestMoneyData", (player) => {
    // Fetch player's money and bank data from the database
    database.pool.query("SELECT Money, Bank FROM accounts WHERE Username=?", [player.accountName], (error, results) => {
        if (error) {
            logUtil.log.error(`Error fetching money data for player ${player.accountName}: ${error.message}`);
            return;
        }

        if (results.length > 0) {
            const { Money, Bank } = results[0];
            // Send the data back to the client
            player.call("receiveMoneyData", [Money, Bank]);
        } else {
            logUtil.log.warn(`No account found for player ${player.accountName}`);
        }
    });
});

function loadAccount(player, sqlID, resultBox) {
    database.pool.query("SELECT * FROM accounts WHERE ID=? LIMIT 1", [sqlID], (error, result) => {
        if (error) {
            logUtil.log.error(`!{#E03232}ERROR: !{#FFFFFF}Account loading failed: ${error.message}`);
            player.call("receiveAuthResult", [false, resultBox, "Failed loading account data."]);
        } else {
            if (result.length > 0) {
                player.isLoggedIn = true;

                player.sqlID = sqlID;
                player.admin = result[0].Admin;
                player.kills = result[0].Kills;
                player.deaths = result[0].Deaths;
                player.regDate = result[0].RegisterDate;
                player.setMoney(result[0].Money);

                player.dimension = player.id + 1;
                player.call("receiveAuthResult", [true]);

                if (config.accountSaveInterval > 0) {
                    player.saveTimer = setInterval(() => {
                        player.saveAccount();
                        player.outputChatBox("!{#2aeee5}[SERVER] !{#FFFFFF}Account saved.");
                    }, config.accountSaveInterval * 60000);
                }

                if(config.dbLogging.logins) {
                    database.pool.query("INSERT INTO log_logins SET AccountID=?, Name=?, SocialClub=?, Serial=?, IP=INET6_ATON(?)", [sqlID, player.name, player.socialClub, player.serial, player.ip]);
                }
            } else {
                player.call("receiveAuthResult", [false, resultBox, "Failed finding acount data."]);
            }
        }
    });
}

// callback hell is real, fml
mp.events.add("loginAccount", (player, username, password) => {
    if (!player.isLoggedIn) {
        if (username.length < 1 || password.length < 1) {
            player.call("receiveAuthResult", [false, "loginResult", "Please fill in all fields."]);
        } else {
            let isLoggedIn = (mp.players.toArray().find(p => p.accountName === username) !== undefined);

            if (isLoggedIn) {
                player.call("receiveAuthResult", [false, "loginResult", "Account is already logged in."]);
            } else {
                database.pool.query("SELECT accounts.ID, accounts.Password, bans.ID as BanID, bans.Reason as BanReason, bans.EndDate as BanEndDate FROM accounts LEFT JOIN bans ON accounts.ID=bans.AccountID WHERE Username=? LIMIT 1", [username], (error, result) => {
                    if (error) {
                        logUtil.log.error(`Account search failed: ${error.message}`);
                        player.call("receiveAuthResult", [false, "loginResult", "Internal error 1."]);
                    } else {
                        if (result.length > 0) {
                            bcrypt.compare(password, result[0].Password, (bcryptError, bcryptResult) => {
                                if (bcryptError) {
                                    logUtil.log.error(`BCrypt comparing failed: ${bcryptError.message}`);
                                    player.call("receiveAuthResult", [false, "loginResult", "Internal error 2."]);
                                } else {
                                    if (bcryptResult) {
                                        if (result[0].BanID) {
                                            if (dateFns.isFuture(result[0].BanEndDate)) {
                                                player.call("receiveAuthResult", [false, "loginResult", `This account is banned.<br><br>Reason: ${result[0].BanReason}<br>Ends on ${dateFns.format(result[0].BanEndDate, "YYYY-MM-DD HH:mm:ss")}`]);
                                            } else {
                                                database.pool.query("DELETE FROM bans WHERE ID=?", [result[0].BanID], (banRemoveError, banRemoveResult) => {
                                                    if (banRemoveError) {
                                                        logUtil.log.error(`Ban removing failed: ${banRemoveError.message}`);
                                                        player.call("receiveAuthResult", [false, "loginResult", `Failed to remove your ban. (Ban ID: ${result[0].BanID})`]);
                                                    } else {
                                                        player.accountName = username;
                                                        loadAccount(player, result[0].ID, "loginResult");
                                                    }
                                                });
                                            }
                                        } else {
                                            player.accountName = username;
                                            loadAccount(player, result[0].ID, "loginResult");
                                        }
                                    } else {
                                        player.call("receiveAuthResult", [false, "loginResult", "Wrong password."]);
                                    }
                                }
                            });
                        } else {
                            player.call("receiveAuthResult", [false, "loginResult", "Couldn't find an account with specified name."]);
                        }
                    }
                });
            }
        }
    }
});

mp.events.add("registerAccount", (player, username, password, verification) => {
    if (!player.isLoggedIn) {
        if (username.length < 1 || password.length < 1 || verification.length < 1) {
            player.call("receiveAuthResult", [false, "registerResult", "Please fill in all fields."]);
        } else if (username.length > 32) {
            player.call("receiveAuthResult", [false, "registerResult", "Username can't exceed 32 characters."]);
        } else if (password !== verification) {
            player.call("receiveAuthResult", [false, "registerResult", "Passwords don't match."]);
        } else {
            database.pool.query("SELECT 1 FROM accounts WHERE Username=? LIMIT 1", [username], (error, result) => {
                if (error) {
                    logUtil.log.error(`Username checking failed: ${error.message}`);
                    player.call("receiveAuthResult", [false, "registerResult", "Internal error 1."]);
                } else {
                    if (result.length > 0) {
                        player.call("receiveAuthResult", [false, "registerResult", "Username already registered."]);
                    } else {
                        bcrypt.hash(password, config.bcryptCost, (bcryptError, hash) => {
                            if (bcryptError) {
                                logUtil.log.error(`BCrypt hashing failed: ${bcryptError.message}`);
                                player.call("receiveAuthResult", [false, "registerResult", "Internal error 2."]);
                            } else {
                                database.pool.query("INSERT INTO accounts SET Username=?, Password=?, Money=?", [username, hash, config.startingMoney], (insertError, insertResult) => {
                                    if (insertError) {
                                        logUtil.log.error(`Player registering failed: ${insertError.message}`);
                                        player.call("receiveAuthResult", [false, "registerResult", "Internal error 3."]);
                                    } else {
                                        player.accountName = username;
                                        loadAccount(player, insertResult.insertId, "registerResult");
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }
});