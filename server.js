
var async = require('async');
var path = require('path');

var httpServer = require('./lib/http-server');
var logging = require('./lib/logging');
var mqDriver = require('./lib/mq-driver');

// Config
var config = require((process.argv.length < 3) ? './config' : path.resolve(process.argv[2]));
var logger = logging(config.log);

var mq = null;

function start() {
    logger.debug('Initializing notifications.');

    // Start listening
    async.series({
        initMq: function(callback){
            mqDriver(function(err, driver) {
                if(err) {
                    callback(err);
                } else {
                    mq = driver;
                    callback();
                }
            }, config.db, logger);
        },
        initServer: function(callback){
            httpServer.start(config, mq, logger, callback);
        }
    }, function(err, res) {
        if(err){
            logger.error(err);
        } else {
            logger.debug('Server initialized.');
        }
    });
}

function stop(err, callback) {
    logger.info('Shutting down the server.');
    async.series({
        closeMq: function(cb) {
            if(mq != null){
                logger.debug('Shutting down mq service.');
                mq.disconnect(cb);
            } else {
                setTimeout(cb, 0);
            }
        },
        closeServer: function(cb) {
            logger.debug('Shutting down http server.');
            httpServer.stop(err, cb);
        }
    }, function(err, res){
        callback(err);
    });
}

process.on('SIGTERM', function(){
    stop(null, function(err){
        process.exit(err ? 1 : 0);
    });
});
process.on('SIGINT', function(){
    stop(null, function(err){
        process.exit(err ? 1 : 0);
    }); 
});
process.once('uncaughtException', function(err) {
    logger.error('Caught exception: %s', err, err);
    stop(err, process.exit.bind(null, 1)); 
});

// Init
start();

