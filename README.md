# Notifications

Small HTTP server to push and retrieve notifications.

## Author

Carlos Mecha, 2015

- Version 1: Developed from 06/08/2015 and released on 06/12/2015.
- Version 2: Developed from 06/15/2015 and released on 06/19/2015.

## Routes

- `GET /:topic?`: Retrieves notifications by topic (global notifications if topic is not set). The route accepts a
query parameter `limit` with limit of returned records. Also, `requeue` could be specified and the retrieved messages won't
be deleted.

- `POST /:topic?`: Pushes a notification to the server. If the topic is not set, the notification would be considered global.
The body defines the payload of the notification. `Content-Type` header defines the format of the payload. Currently supported:

    - `application/json`: JSON payload. Default if the header is not provided.

If the content type is not supported, is going to be stored as a binary array, and returned as an array of bytes or string, using
the default encoder and decoder.

To add custom encoders/decoders, update `mq.encoders` and `mq.decoders` with the supported format types. 

## Configuration
The default configuration file is `config.json` if it's not specified as an argument.

By default, the server listen the port 3000.

Before start, remember to run:

```bash
npm install
```

### Configuration for the node client
```bash
$ npm link
$ cd client/node
$ npm link notifications
$ npm install
```

### Configuration for the bash client.
Just install `curl`.

## Tests
Run:
```bash
$ npm start test/test-config # Optional step for integration tests.
$ npm test
```

And for the node client:
```bash
$ cd client/node
$ npm test
```

## Clients
See `clients/` folder.

## Start the server

```bash
$ npm start [configuration file]
```

## Contribute

These tiny pieces of code (notifications, mqlite, etc) are ideas or prototypes developed in
~6 hours. If you find this code useful, feel free to do whatever you want with it. Help/ideas/bug
reporting are also welcome.

Thanks!
