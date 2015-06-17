
# Notifications client

Tiny client to retrieve and post notifications to the server.

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

