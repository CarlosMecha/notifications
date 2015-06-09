# Notifications

## Author

Carlos Mecha, 2015

## Version v1

Small HTTP server to push and pull notifications.

## Routes

- `GET /:topic?`: Retrieves notifications by topic (all if topic is not set). The route accepts a
query parameter `limit` with limit of returned records.

- `POST /:topic?`: Pushes a notification to the server. If the topic is not set, the default one will be assigned.
The body defines the payload of the notification.

## Configuration
By default, the server listen the port 3000.

## Start the server

```bash
$ npm start
```

