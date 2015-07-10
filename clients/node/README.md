
# Notifications client

Tiny client to retrieve and post notifications to the server as JSON.

## Configuration for the node client
```bash
$ npm link
$ cd client/node
$ npm link notifications
$ npm install
```

## Tests
Make sure the server is running for the integrations tests.

```bash
$ cd client/node
$ npm test
```

## Usage

```javascript

var NotifClient = require('notif-client');
var client = NotifClient(3000, 'localhost');

client.post('topic1', { level: 'warning', text: 'This is fooooo' }, function(err){
    console.log(err ? 'Error! ' + err : 'OK');
});

client.get('topic1', 1, false, function(err, res){
    console.log(er ? 'Error! ' + err : res);
});
```

