
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var util = require('util');

// Config
var config = require((process.argv.length < 3) ? './config' : path.resolve(process.argv[2]));

var Mq = require('./mq');
var logger = require('./lib/logging')(config.log);
var routes = require('./lib/routes');

// Mq service
var dbFile = null;
if(config.db.persistent) {
    logger.debug('Set persistent mq service.');
    dbFile = config.db.filename;
} else {
    logger.debug('Set ephemeral mq service.');
}

var queues = new Mq(dbFile);
queues.encoders = {
    'application/json': JSON.stringify
};
queues.decoders = {
    'application/json': JSON.parse
};
queues.logger = logger;

// Express App
var server = null;
var app = express();

app.use(bodyParser.json());

routes(app, queues, logger);

function shutdown(callback) {
    logger.info('Shutting down the server.');
    async.series({
        closeMq: function(cb) {
            if(queues != null){
                logger.debug('Shutting down mq service.');
                queues.close(cb);
            } else {
                setTimeout(cb, 0);
            }
        },
        closeServer: function(cb) {
            if(server != null){
                logger.debug('Shutting down http server.');
                server.close(cb);
            } else {
                setTimeout(cb, 0);
            }
        }
    }, function(err, res){
        callback(err);
    });
}

process.on('SIGTERM', function(){
    shutdown(function(err){
        process.exit(err ? 1 : 0);
    });
});
process.on('SIGINT', function(){
    shutdown(function(err){
        process.exit(err ? 1 : 0);
    }); 
});
process.on('uncaughtException', function(err) {
    logger.error('Caught exception: %s', err, err);
    shutdown(function(err){
        process.exit(err ? 1 : 0);
    }); 
});

// Init
logger.debug('Initializing the server.');

// Start listening
async.series({
    initMq: function(callback){
        logger.info('MQ Service ready and listening.');
        queues.listen(callback);
    },
    initServer: function(callback){
        server = app.listen(config.port, config.host, function(){
            var host = server.address().address;
            var port = server.address().port;
            logger.info('HTTP server listening at http://%s:%s', host, port);
        });
    }
}, function(err, res) {
    if(err){
        logger.error(err);
    } else {
        logger.debug('Server initialized.');
    }
});

/**
 * To control the server from an external application.
 */
module.exports = {
    server: server,
    mq: queues,
    host: config.host,
    port: config.port,
    logger: logger,
    shutdown: shutdown
};

