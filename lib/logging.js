
var winston = require('winston');

/**
 * Configures the logger.
 *
 * @param config Configuration object.
 */
module.exports = function(config) {
    var transports = [];

    if(config.persistent) {
        transports.push(new winston.transports.File({
            filename: config.filename,
            level: config.level
        }));
    } else {
        transports.push(new winston.transports.Console({
            level: config.level
        }));
    }

    return new winston.Logger({transports: transports});
};

