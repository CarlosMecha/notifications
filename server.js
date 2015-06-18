
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var path = require('path');
var util = require('util');
var Mq = require('./mq');
var config = require((process.argv.length < 3) ? './config' : path.resolve(process.argv[2]));

// Logging
var transports = [];
if(config.log.persistent) {
    transports.push(new winston.transports.File({
            filename: config.log.filename,
            level: config.log.level
    }));
} else {
    transports.push(new winston.transports.Console({
            level: config.log.level
    }));
}

var logger = new winston.Logger({transports: transports});

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

app.get('/:topic?', function(req, res){
    logger.debug('Received GET %s', req.originalUrl);
    var topic = req.params.topic;
    var limit = req.query.limit || 1;
    var requeue = (req.query.requeue !== undefined);

    logger.debug('Translated to GET /%s?limit=%d&requeue=%s', topic, limit, requeue);

    queues.get(topic, limit, requeue, function(err, results){
        if(err){
            logger.error(err);
            res.status(500).json({error: err});
        } else {
            logger.debug('Returned from %s, %d results: %j', req.originalUrl, results.length, results, {});
            res.json(results);
        }
    });
});

var defaultContentType = 'application/json';
app.post('/:topic?', function(req, res){
    logger.debug('Received POST %s', req.originalUrl);
    logger.debug('Body %j', req.body, {});
    var topic = req.params.topic || 'default';
    var format = req.get('Content-Type') || defaultContentType;
    queues.push(topic, format, req.body, function(err){
        if(err){
            logger.error(err);
            res.status(500).json({error: err});
        } else {
            logger.debug('Returned OK from %s', req.originalUrl);
            res.json({code: 'OK'});
        }
    });
});

function shutdown() {
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
        process.exit(err ? 1 : 0);
    });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', function(err) {
    logger.error('Caught exception: %s', err, err);
    shutdown();
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

