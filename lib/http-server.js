
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');

var defaultLogger = require('./logging').default;
var routes = require('./routes');

var server = null;
var globalLogger = null;

/**
 * Starts the http server.
 *
 * @param config Configuration object.
 * @param mq MQ Service.
 * @param logger Logger.
 * @param callback Callback.
 */
function start(config, mq, logger, callback) {

    var app = express();
    app.use(bodyParser.json());

    globalLogger = logger || defaultLogger;
    routes(app, mq, logger);

    server = app.listen(config.port, config.host, function(){
        var host = server.address().address;
        var port = server.address().port;
        globalLogger.info('HTTP server listening at http://%s:%s', host, port);
        callback();
    });

}

/**
 * Shutdowns the server.
 *
 * @param err Error.
 * @param callback Callback.
 */
function stop(err, callback) {
    if(server != null){
        if(err) {
            globalLogger.info('Shutting down the http server due to an error: ', err);
        } else {
            globalLogger.debug('Shutting down http server.');
        }
        server.close(callback);
    } else {
        setTimeout(callback, 0);
    }
}

module.exports = {
    start: start,
    stop: stop
};

