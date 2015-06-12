# Notifications

## Author

Carlos Mecha, 2015

## Version 1

Developed form 06/15/2015 and released on 06/19/2015.

Small HTTP server to push and retrieve notifications.

## Routes

- `GET /:topic?`: Retrieves notifications by topic (all if topic is not set). The route accepts a
query parameter `limit` with limit of returned records. Also, `requeue` could be specified and the retrieved messages won't
be deleted.

- `POST /:topic?`: Pushes a notification to the server. If the topic is not set, the default one will be assigned.
The body defines the payload of the notification.

## Configuration
Check `config.json`.

By default, the server listen the port 3000.

Before start, remember to run:

```bash
npm install
```

## Tests
TODO (for v2).

## Scripts
- `conf.sh`: Host and port configurations.
- `get.sh <topic> <limit>`: Gets and requeues notifications.
- `pop.sh <topic> <limit>`: Retrieves notifications.
- `push.sh <topic> <data>`: Pushes a notification.  

## Start the server

```bash
$ npm start
```

