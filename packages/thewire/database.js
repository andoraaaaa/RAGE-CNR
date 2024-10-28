const mysql = require("mysql");
const config = require("./config");
const logUtil = require("./logUtil");

module.exports = {
    pool: undefined,

    init: function(callback) {
        this.pool = mysql.createPool(config.database);

        this.pool.getConnection((error, connection) => {
            if (error) {
                logUtil.log.error(`Database connection failed: ${error.message}`);
            } else {
                logUtil.log.info("Connected to the database.");
                callback();
            }

            connection.release();
        });
    }
};