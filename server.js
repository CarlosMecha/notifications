
var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var util = require('util');
var app = express();
var mq = require('./mq');

var config = require('./config');

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

var queues = null;
var server = null;

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

app.post('/:topic?', function(req, res){
    logger.debug('Received POST %s', req.originalUrl);
    logger.debug('Body %j', req.body, {});
    var topic = req.params.topic || 'default';
    queues.push(topic, req.body, function(err){
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
    if(queues != null){
        logger.debug('Shutting down mq service.');
        queues.close();
    }
    if(server != null){
        logger.debug('Shutting down http server.');
        server.close();
    }
}

function init(err, mqService) {
    if(err) {
        logger.error(err);
        return;
    }

    queues = mqService;
    server = app.listen(config.port, config.host, function(){
        var host = server.address().address;
        var port = server.address().port;
        logger.info('Server listening at http://%s:%s', host, port);
    });

}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Init
logger.debug('Initializing the server.');
if(config.db.persistent) {
    logger.debug('Set persistent mq service.');
    mq(config.db.filename, init);
} else {
    logger.debug('Set efemeral mq service.');
    mq(init);
}

