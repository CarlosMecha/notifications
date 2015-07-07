
var async = require('async');
var mqlite = require('mqlite');

var defaultLogger = require('./logging').default;


/**
 * Driver object. It keeps a connection opened.
 */
function Driver(connection, logger) {

    this.connection = connection;
    this.producer = new mqlite.Producer(this.connection);
    this.consumer = new mqlite.Consumer(this.connection);

    this.logger = logger;
    this.producer.logger = logger;
    this.consumer = logger;

}

/**
 * Disconnects from MQLite.
 *
 * @param callback Callback.
 */
Driver.prototype.disconnect = function(callback) {
    
    this.logger.debug('Shutting down mq service.');
    var self = this;

    async.series({
        closeConsumer: function(cb) {
            self.consumer.close(cb);
        },
        closeProducer: function(cb) {
            self.producer.close(cb);
        },
        closeConnection: function(cb) {
            self.connection.close(cb);
        }
    }, function(err) {
        if(err) {
            self.logger.error('Error closing the connection to MQLite', err, { error: err });
            callback(err);
        } else {
            self.logger.info('MQ connection closed.');
            callback();
        }
    });

};

/**
 * Creates a message.
 * 
 * @param headers Custom headers.
 * @param payload Payload.
 *
 * @return The new message.
 */
Driver.prototype.createMessage = function(headers, payload) {
    
    var payload = payload || {};
    var headers = headers || {};

    headers['created-by'] = 'notifications-server';

    return new mqlite.Message(headers, payload);
};

/**
 * Connects to the MQ service.
 *
 * @param callback A callback activated when the driver has stablished a connection.
 * @param config Optional. A configuration object.
 * @param logger Optional. The logger.
 *
 * @return Driver object.
 */
module.exports = function connect(callback, config, logger) {

    var logger = logger || defaultLogger;
    var config = config || { persistent: false };
    var dbFile = null;

    if(config.persistent) {
        logger.debug('Set persistent mq service.');
        dbFile = config.filename;
    } else {
        logger.debug('Set ephemeral mq service.');
    }

    // Connection
    var conn = new mqlite.Connection(dbFile);
    conn.logger = logger;
    conn.encoders['application/json'] = JSON.stringify;
    conn.decoders['application/json'] = JSON.parse;

    conn.listen(function(err){
        if(err) {
            logger.error('Error opening the connection to MQLite', err, { error: err });
            callback(err);
        } else {
            logger.info('MQ Service ready and listening.');
            callback(null, new Driver(conn, logger)); 
        }
    });
};

