
var async = require('async');
var fs = require('fs');
var uuidGenerator = require('node-uuid');
var sqlite = require('sqlite3').verbose();

var checkStmt = 'SELECT 1 FROM notifications';
var insertStmt = 'INSERT INTO notifications (uuid, payload) VALUES (?, ?)';
var selectStmt = 'SELECT uuid, timestamp, topic, payload FROM notifications ORDER BY timestamp LIMIT ?';
var deleteStmt = 'DELETE FROM notifications WHERE uuid = ?';
var schema = './schema.sql';

module.exports = function(databaseFile, callback) {
    

    var dbFile = databaseFile;
    var cb = callback;
    
    if(typeof(dbFile) == 'function') {
        dbFile = ':memory:';
        cb = databaseFile;
    }

    var db = new sqlite.Database(dbFile);
    var insert = null;
    var select = null;
    var del = null;

    /**
     * Checks if the database exists and is accesible.
     */
    function checkDb(cb) {
        db.get('SELECT 1', function(err, row){
            cb((err != undefined));
        });
    }

    /**
     * Checks if the schema is present.
     */
    function checkSchema(cb){
        db.get(checkStmt, function(err, row){
            cb((err != undefined));
        });
    }

    /**
     * Creates the schema.
     */
    function createSchema(schema, cb) {
        async.waterfall([
            function(callback){
                fs.readFile(schema, function(err, data){
                    if(err){
                        callback(err);
                    } else {
                        callback(null, data);
                    }
                });
            },
            function(sql, callback){
                db.run(sql, callback);
            }
        ], function(err, results){
            cb(err);
        });
    }

    /**
     * Initializes the database.
     */
    function init(schema, cb){
        async.waterfall([
            function(callback){
                checkDb(function(exists) {
                    if(!exists){
                        callback(new Error('Database doesn\'t exist.'));
                    } else {
                        callback(null, true);
                    }
                });
            },
            function(_, callback){
                checkSchema(function(exists){
                    callback(null, exists);
                });
            },
            function(exists, callback){
                if(exists){
                    setTimeout(function(){
                        callback(null);
                    }, 0);
                } else {
                    createSchema(schema, callback);
                }
            },
            function(_, callback) {
                insert = db.prepare(insertStmt, callback);
            },
            function(_, callback) {
                select = db.prepare(selectStmt, callback);
            },
            function(_, callback) {
                del = db.prepare(deleteStmt, callback);
            }
        ], cb);
    }

    /**
     * Pushes a message.
     * @param topic Message topic.
     * @param payload Message payload.
     * @param callback Callback that accepts an error has first parameter.
     */
    function push(topic, payload, callback){
        var uuid = uuidGenerator.v1();
        var timestamp = Date.now();
        insert.run(topic, timestamp, JSON.stringify(payload), callback);
    }

    /**
     * Gets messages.
     * @param topic Message topic.
     * @param limit Number of messages.
     * @param requeue Put the messages back.
     * @param callback Function that accepts an error as a first argument and list of messages as second.
     */
    function get(topic, limit, requeue, callback){
        
        var results = [];
        if(requeue){
            select.each(
                limit,
                function(err, row){
                    if(!err) {
                        results.push(row);   
                    }
                },
                function(err, results){
                    callback(err, results);
                }
            );
        } else {
            var uuids = [];
            async.series({
                get: function(cb) {
                    select.each(
                        limit,
                        function(err, row){
                            if(!err) {
                                results.push(row);   
                                uuids.push(row.uuid);
                            }
                        },
                        function(err, results){
                            cb(err, results);
                        }
                },
                pop: function(cb) {
                    // All synchronous
                    uuids.forEach(function(uuid){
                        del.run(uuid);
                    });
                    setTimeout(function(){
                        cb(null);
                    }, 0);
                }
            }, function(err, results){
                callback(err, (err) ? null : results);
            }
        }
    }

    /**
     * Closes the database.
     */
    function close() {
        db.close();
    }

    init(function(err){
        if(err) {
            cb(err);
        } else {
            cb(null, {
                _db : db,
                push: push,
                get: get,
                close: close
            });
        }
    });

};

