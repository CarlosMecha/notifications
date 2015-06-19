
var assert = require('chai').assert;
var async = require('async');
var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var url = require('url');
var sinon = require('sinon');
var sys = require('sys');

describe('Client', function(){

    var Client = null;
    var mockRequest = null;

    beforeEach('Mocking request library', function(){
        mockRequest = sinon.stub();
        Client = proxyquire('../notif-client', { request: mockRequest });
    });

    describe('initializes', function(){
        it('pointing to the correct address', function() {
            var host = '12.23.34.45';
            var port = 3456;
            var client = new Client(port, host);
            expect(client).to.be.ok;
            expect(client.port).to.equals(port);
            expect(client.host).to.equals(host);
        });

        it('pointing to the default address', function() {
            var host = '127.0.0.1';
            var port = 3000;
            var client = new Client();
            expect(client).to.be.ok;
            expect(client.port).to.equals(port);
            expect(client.host).to.equals(host);
        });
    });

    describe('stores and retrieves notifications', function(){

        var topic = 'test-topic';
        var contentType = 'application/json';
        var payload = {foo: 'foo-test'};
        
        it('stores as JSON', function(done){
            
            mockRequest.callsArgWith(1, null, {}, '{"code": "OK"}');

            var client = new Client();

            client.post(topic, payload, function(err){
                expect(err).to.not.exists;
                expect(mockRequest.called).to.be.true;
                done();
            });

        });    

        it('retrieves as JSON', function(done){

            mockRequest.callsArgWith(1, null, {}, JSON.stringify(
                [{uuid: 1, topic: topic, format: contentType, timestamp: 1, payload: payload}]
            ));

            var client = new Client();

            client.get(topic, 1, true, function(err, res){
                expect(err).to.not.exists;
                expect(mockRequest.called).to.be.true;
                expect(res).to.be.ok;
                expect(res).to.have.length(1);
                var notif = res[0];
                expect(notif).to.be.ok;
                expect(notif.topic).to.be.ok;
                expect(notif.topic).to.equals(topic);
                expect(notif.uuid).to.be.ok;
                expect(notif.uuid).to.equals(1);
                expect(notif.timestamp).to.be.ok;
                expect(notif.timestamp).to.equals(1);
                expect(notif.format).to.be.ok;
                expect(notif.format).to.equals(contentType);
                expect(notif.payload).to.be.ok;
                expect(notif.payload.foo).to.equals(payload.foo);
                done();
            });
            
        });

    });
});


