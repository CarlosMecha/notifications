
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
                    pathname: '/'
                })
            }, function(err, response, body) {
                expect(err).to.not.exists;
                expect(response).to.be.ok;
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

        it('stores without topic', function(done){

            request.post({
                body: JSON.stringify(payload),
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port
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

        it('retrieves without topic', function(done){

            async.waterfall([
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
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
                    expect(notif.topic).to.not.exists;
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

describe('Routes', function(){

    var contentType = 'application/json';

    describe('GET /', function(){

        // Removes previous global notifications.
        beforeEach(function(done) {
            request.get({
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    query: {limit: 100}
                })
            }, function(err, response, body) {
                done();
            });

        });


        it('is working', function(done) {
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

        it('retrieves global notifications', function(done) {

            async.waterfall([
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                // The global notification
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is a global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(body).to.be.ok;
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.be.ok;
                    expect(body).to.have.length(1);
                    expect(body[0].topic).to.not.exists;
                    expect(body[0].payload.field).to.equals('this is a global notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });

        it('retrieves in order', function(done) {

            async.waterfall([
                // The global notification 1
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the first global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                // The global notification 2
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the second global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            query: {limit: 2}
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.have.length(2);
                    expect(body[0].payload.field).to.equals('this is the first global notification');
                    expect(body[1].payload.field).to.equals('this is the second global notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });
    });

    describe('POST /', function(){

        // Removes previous global notifications.
        beforeEach(function(done) {
            request.get({
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    query: {limit: 100}
                })
            }, function(err, response, body) {
                done();
            });

        });

        it('is working', function(done) {
            request.post({
                body: JSON.stringify({field: 'foo'}),
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    pathname: '/'
                })
            }, function(err, response, body) {
                expect(err).to.not.exists;
                expect(response.statusCode).to.equals(200);
                expect(body).to.be.ok;
                expect(JSON.parse(body).code).to.equals('OK');
                done();
            });
        });

        it('stores global notifications', function(done) {

            async.waterfall([
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                // The global notification
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is a global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(body).to.be.ok;
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.be.ok;
                    expect(body).to.have.length(1);
                    expect(body[0].topic).to.not.exists;
                    expect(body[0].payload.field).to.equals('this is a global notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });

        it('stores in order', function(done) {

            async.waterfall([
                // The global notification 1
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the first global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                // The global notification 2
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the second global notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            query: {limit: 2}
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.have.length(2);
                    expect(body[0].payload.field).to.equals('this is the first global notification');
                    expect(body[1].payload.field).to.equals('this is the second global notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });
    });

    describe('GET /<random>', function(){

        var randomTopic = null;

        // Removes previous global notifications.
        beforeEach(function(done) {
            require('crypto').randomBytes(48, function(ex, buf) {
                randomTopic = buf.toString('hex');
                done();
            });
        });


        it('is working', function(done) {
            request.get({
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    pathname: randomTopic
                })
            }, function(err, response, body) {
                expect(err).to.not.exists;
                expect(response.statusCode).to.equals(200);
                done();
            });
        });

        it('retrieves notifications', function(done) {

            async.waterfall([
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                // The random notification
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is a random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(body).to.be.ok;
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.be.ok;
                    expect(body).to.have.length(1);
                    expect(body[0].topic).to.equals(randomTopic);
                    expect(body[0].payload.field).to.equals('this is a random notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });

        it('retrieves in order', function(done) {

            async.waterfall([
                // The random notification 1
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the first random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                // The global notification 2
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the second random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            query: {limit: 2},
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.have.length(2);
                    expect(body[0].topic).to.equals(randomTopic);
                    expect(body[0].payload.field).to.equals('this is the first random notification');
                    expect(body[1].topic).to.equals(randomTopic);
                    expect(body[1].payload.field).to.equals('this is the second random notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });
    });

    describe('POST /<random>', function(){

        var randomTopic = null;

        // Removes previous global notifications.
        beforeEach(function(done) {
            require('crypto').randomBytes(48, function(ex, buf) {
                randomTopic = buf.toString('hex');
                done();
            });
        });


        it('is working', function(done) {
            request.post({
                body: JSON.stringify({field: 'foo'}),
                uri: url.format({
                    protocol: 'http',
                    hostname: config.host,
                    port: config.port,
                    pathname: randomTopic
                })
            }, function(err, response, body) {
                expect(err).to.not.exists;
                expect(response.statusCode).to.equals(200);
                expect(body).to.be.ok;
                expect(JSON.parse(body).code).to.equals('OK');
                done();
            });
        });

        it('stores notifications', function(done) {

            async.waterfall([
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                // The random notification
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is a random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(body).to.be.ok;
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.be.ok;
                    expect(body).to.have.length(1);
                    expect(body[0].topic).to.equals(randomTopic);
                    expect(body[0].payload.field).to.equals('this is a random notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });

        it('stores in order', function(done) {

            async.waterfall([
                // The random notification 1
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the first random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(cb) {
                    require('crypto').randomBytes(48, function(ex, buf) {
                        cb(null, buf.toString('hex'));
                    });
                },
                // Another notification
                function(otherTopic, callback) {
                    request.post({
                        body: JSON.stringify({otherField: 'otherValue'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: otherTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                // The global notification 2
                function(callback) {
                    request.post({
                        body: JSON.stringify({field: 'this is the second random notification'}),
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        expect(body).to.be.ok;
                        expect(JSON.parse(body).code).to.equals('OK');
                        callback();
                    });
                },
                function(callback) {
                    request.get({
                        uri: url.format({
                            protocol: 'http',
                            hostname: config.host,
                            port: config.port,
                            query: {limit: 2},
                            pathname: randomTopic
                        }),
                        headers: {
                            'User-Agent': 'test-notif-client',
                            'Content-Type': contentType,
                            'Accept': contentType
                        }
                    }, function(err, response, body) {
                        expect(err).to.not.exists;
                        expect(response.statusCode).to.equals(200);
                        callback(null, body);
                    });
                },
                function(body, callback) {
                    body = JSON.parse(body);
                    expect(body).to.have.length(2);
                    expect(body[0].topic).to.equals(randomTopic);
                    expect(body[0].payload.field).to.equals('this is the first random notification');
                    expect(body[1].topic).to.equals(randomTopic);
                    expect(body[1].payload.field).to.equals('this is the second random notification');
                    callback();
                }
            ], function(err) {
                expect(err).to.not.exists;
                done();
            });
        });
    });

});


