
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var app = express();
var mq = require('./mq');

var queues = null;
var server = null;

app.use(bodyParser.json());

app.get('/:topic?', function(req, res){
    var topic = req.params.topic;
    var limit = req.query.limit || 1;
    var requeue = (req.query.requeue !== undefined);
    queues.get(topic, limit, requeue, function(err, res){
        if(err){
            res.status(500).json({error: err});
        } else {
            res.json(res);
        }
    });
});

app.post('/:topic?', function(req, res){
    var topic = req.params.topic || 'default';
    queues.push(topic, function(err){
        if(err){
            res.status(500).json({error: err});
        } else {
            res.json({code: 'OK'});
        }
    });
});

function shutdown() {
    console.log('Shutting down the server.');
    if(queues != null){
        queues.close();
    }
    if(server != null){
        server.close();
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

mq(function(err, q) {
    if(err) {
        console.error(err);
        return;
    }

    queues = q;
    server = app.listen(3000, function(){
        var host = server.address().address;
        var port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);
    });
});

