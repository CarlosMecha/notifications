
var assert = require('chai').assert;
var async = require('async');
var expect = require('chai').expect;
var uuidGenerator = require('node-uuid');
var sys = require('sys');

var connect = require('../lib/mq-driver');

describe('MQ Driver', function(){
    it('initializes the connection', function(done) {
        connect(function(err, driver) {
            expect(err).to.not.exists;
            expect(driver).to.be.ok;
            expect(driver.producer).to.be.ok;
            expect(driver.consumer).to.be.ok;
            expect(driver.connection).to.be.ok;
            expect(driver.connection.opened).to.be.true;
            driver.disconnect(done);
        }, {persistent: false});
    });

    it('closes the connection', function(done){
        connect(function(err, driver) {
            expect(err).to.not.exists;
            expect(driver).to.be.ok;
            driver.disconnect(function(err) {
                expect(err).to.not.exists;
                expect(driver.connection.opened).to.be.false;
                done();
            });
        }, {persistent: false});
    });

    it('and creates messages', function(done){
        connect(function(err, driver) {
            expect(err).to.not.exists;
            expect(driver).to.be.ok;
            var msg = driver.createMessage({topic: 'foo'}, {field: 'value'});
            expect(msg).to.be.ok;
            expect(msg.headers['topic']).to.equals('foo');
            expect(msg.headers['created-by']).to.equals('notifications-server');
            expect(msg.payload['field']).to.equals('value');
            driver.disconnect(done);
        }, {persistent: false});
    });

});


