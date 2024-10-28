const bcrypt = require("bcryptjs");
const dateFns = require("date-fns");
const database = require("../database");
const logUtil = require("../logUtil");
const config = require("../config");

function loadAccount(player, sqlID, resultBox) {
    database.pool.query("SELECT * FROM accounts WHERE ID=? LIMIT 1", [sqlID], (error, result) => {
        if (error) {
            logUtil.log.error(`Account loading failed: ${error.message}`);
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
                        player.outputChatBox("Account saved.");
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