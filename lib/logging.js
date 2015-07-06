
var winston = require('winston');

/**
 * Configures the logger.
 *
 * @param config Configuration object.
 */
function configure(config) {
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
}

/**
 * The default logger is a big NOOP.
 */
configure.default = function(){};
configure.default.info = function(){};
configure.default.debug = function(){};
configure.default.trace = function(){};
configure.default.warn = function(){};
configure.default.error = function(){};

module.exports = configure;

