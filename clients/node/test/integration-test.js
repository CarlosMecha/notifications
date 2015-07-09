
var assert = require('chai').assert;
var async = require('async');
var expect = require('chai').expect;
var Client = require('../notif-client');
var request = require('request');
var url = require('url');
var sys = require('sys');

var config = require('../../../test/test-config');

describe('Client', function(){


    it('pings the server', function(done) {
        request.get({
            uri: url.format({
                protocol: 'http',
                hostname: config.host,
                port: config.port,
                pathname: '/'
            })
        }, function(err, response, body) {
            expect(err).to.not.exists;
            expect(response.statusCode).to.equals(200);
            done();
        });
    });

    it('connects to the server', function(done) {
        var host = '127.0.0.1';
        var port = 3000;
        var client = new Client(config.port, config.host);
        expect(client).to.be.ok;
        client.get(null, 1, 1, function(err, results){
            expect(err).to.not.exists;
            done();
        });
    });

    it('stores and retrieves as JSON', function(done){
        
        var client = new Client(config.port, config.host);
        var topic = null;
        var contentType = 'application/json';
        var payload = {foo: 'foo-test'};

        async.series({
            topic: function(cb) {
                require('crypto').randomBytes(48, function(ex, buf) {
                    topic = buf.toString('hex');
                    cb();
                });
            },
            post: function(cb) {
                client.post(topic, payload, function(err){
                    cb(err);
                });
            },
            get: function(cb) {
                client.get(topic, 1, false, function(err, res){
                    expect(res).to.be.ok;
                    expect(res).to.have.length(1);
                    var notif = res[0];
                    expect(notif).to.be.ok;
                    expect(notif.topic).to.be.ok;
                    expect(notif.topic).to.equals(topic);
                    expect(notif.uuid).to.be.ok;
                    expect(notif.timestamp).to.be.ok;
                    expect(notif.format).to.be.ok;
                    expect(notif.format).to.equals(contentType);
                    expect(notif.payload).to.be.ok;
                    expect(notif.payload.foo).to.equals(payload.foo);
                    cb();
                });
            }
        }, function(err) {
            expect(err).to.not.exists;
            done();
        });    
    });
});


