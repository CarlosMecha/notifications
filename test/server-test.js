
var assert = require('chai').assert;
var async = require('async');
var expect = require('chai').expect;
var request = require('request');
var url = require('url');
var sys = require('sys');
var config = require('./test-config');

/**
 * Before these tests, make sure the server is running using `test-config.json` configuration.
 */

describe('HTTP Server', function(){

    describe('is running for these tests', function(){
        it('ping', function(done) {
            request.get({
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    pathname: ''
                })
            }, function(err, response, body) {
                expect(err).to.not.exists;
                done();
            });
        });
    });

    describe('stores and retrieves notifications', function(){
        var topic = 'test-topic';
        var contentType = 'application/json';
        var payload = {foo: 'foo-test'};
        
        it('stores as JSON', function(done){

            request.post({
                body: JSON.stringify(payload),
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    pathname: topic
                }),
                headers: {
                    'User-Agent': 'test-notif-client',
                    'Content-Type': contentType,
                    'Accept': contentType
                }
            }, function(err, response, body) {
                expect(err).to.not.exists;
                expect(body).to.be.ok;
                done();
            });

        });    

        it('retrieves as JSON', function(done){

            async.waterfall([
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: topic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(body).to.be.ok;
                        callback(body);
                    });
                },
                function(body, callback) {
                    expect(body).to.be.ok;
                    expect(body).to.have.length(limit);
                    var notif = body[0];
                    expect(notif).to.be.ok;
                    expect(notif.topic).to.be.ok;
                    expect(notif.topic).to.equals(topic);
                    expect(notif.uuid).to.be.ok;
                    expect(notif.timestamp).to.be.ok;
                    expect(notif.format).to.be.ok;
                    expect(notif.format).to.equals(contentType);
                    expect(notif.payload).to.be.ok;
                    expect(notif.payload.foo).to.equals(payload.foo);
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });

        });    

    });
});


