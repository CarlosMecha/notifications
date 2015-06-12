
var request = require('request');
var url = require('url');

module.exports = function(port, host) {
    
    var h = host;
    var p = port;

    if(host === undefined){
        h = '127.0.0.1';
    }
    if(port === undefined){
        p = 3000;
    }

    function get(topic, limit, callback) {
        request({
            method: 'GET',
            uri: url.format({
                protocol: 'http',
                hostname: h,
                port: p,
                pathname: topic,
                query: {
                    limit: limit,
                    requeue: true
                }
            })
        }, function(err, response, body){
            if(err) {
                callback(err);
            } else {
                callback(null, body);   
            }
        });
    }

    function pop(topic, limit, callback){
        request({
            method: 'GET',
            uri: url.format({
                protocol: 'http',
                hostname: h,
                port: p,
                pathname: topic,
                query: {
                    limit: limit
                }
            })
        }, function(err, response, body){
            if(err) {
                callback(err);
            } else {
                callback(null, body);   
            }
        });
    }

    function push(topic, payload, callback){
        request({
            method: 'POST',
            json: true,
            body: payload,
            uri: url.format({
                protocol: 'http',
                hostname: h,
                port: p,
                pathname: topic
            })
        }, function(err, response, body){
            callback((err !== undefined));
        });
    }

    return {
        get: get,
        pop: pop,
        push: push
    }
};

