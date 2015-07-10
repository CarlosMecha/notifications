
var async = require('async');
var request = require('request');
var url = require('url');

/**
 * Client constructor.
 * 
 * MqClient([port, [host]])
 * @param port Port to connect, by default 3000.
 * @param host Host to connect, by default localhost.
 *
 * By default, the encoder and decoder are JSON parsers, and the content type
 * 'application/json'.
 *
 */
function NotifClient(port, host){
    if(host === undefined){
        host = '127.0.0.1';
    }

    if(port === undefined){
        port = 3000;
        host = '127.0.0.1';
    }

    this.host = host;
    this.port = port;
    this.logger = {
        info: function(){},
        debug: function(){},
        trace: function(){},
        warn: function(){},
        error: function(){}
    };
    this.contentType = 'application/json'
    this.encode = JSON.stringify;
    this.decode = JSON.parse;
    this._headers = {
        'User-Agent': 'notif-client',
        'Content-Type': this.contentType,
        'Accept': this.contentType
    };

}

/**
 * Retrieves notifications.
 * 
 * @param topic Topic
 * @param limit Number of notifications to retrieve.
 * @param requeue Specifies if requeue the notifications or not.
 * @param callback Function that accepts an error and a list of notifications previously decoded.
 */
NotifClient.prototype.get = function(topic, limit, requeue, callback){
    var self = this;
    this.logger.debug("Requesting %d notifications for topic %s", limit, topic, {});
    
    var query = {
        limit: limit
    };
    if(requeue){
        query.requeue = true;
    }

    request({
        method: 'GET',
        uri: url.format({
            protocol: 'http',
            hostname: this.host,
            port: this.port,
            pathname: topic || '/',
            query: query
        }),
        headers: this._headers
    }, function(err, response, body){
        if(err) {
            self.logger.err("Error requesting notifications %s", err, {error: err});
            callback(err);
        } else {
            self.logger.debug("Retrieved notifications %s", body, {});
            callback(null, self.decode(body));   
        }
    });
};

/**
 * Uploads a notification.
 * 
 * @param topic Notification's topic.
 * @param payload Notification's payload.
 * @param callback Function that accepts an error argument.
 */
NotifClient.prototype.post = function(topic, payload, callback) {
    var self = this;
    this.logger.debug("Posting notification %s %s", topic, payload, {});

    request({
        method: 'POST',
        body: this.encode(payload),
        uri: url.format({
            protocol: 'http',
            hostname: this.host,
            port: this.port,
            pathname: topic || '/'
        }),
        headers: this._headers
    }, function(err, response, body){
        if(err){
            self.logger.error("Received %s from server", err, {error: err});
            callback(err);
        } else {
            self.logger.debug("Received OK from server");
            callback();
        }
    });
};

module.exports = NotifClient;

