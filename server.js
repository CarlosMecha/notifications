
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var app = express();

app.use(bodyParser.json());

var testNotifications = [
    {
        topic: 'topic1',
        timestamp: new Date(),
        payload: { hola: 'que tal' }
    },
    {
        topic: 'default',
        timestamp: new Date(),
        payload: { adios: 'talue' }
    }
];

app.get('/:topic?', function(req, res){
    var topic = req.params.topic;
    var limit = req.query.limit || 1;
    var notifications = [];
    testNotifications.forEach(function(val){
        if(val.topic === topic || !topic){
            notifications.push(val);
        }
    });
    notifications.sort(function(not1, not2){
        return (not1.timestamp - not2.timestamp);
    });
    res.json(notifications.slice(0, limit));
});

app.post('/:topic?', function(req, res){
    var topic = req.params.topic || 'default';
    var timestamp = new Date();
    var notification = {
        topic: topic,
        timestamp: timestamp,
        payload: req.body
    };
    res.json(notification);
});

var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});

