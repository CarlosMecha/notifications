
# Bash client

Scripts to retrieve and upload notifications to the server.

## Requirements

- Curl: `curl` should be installed.

## Configuration.

See `conf.sh`. These parameters could be also overrided by environment variables as:

```bash
$ HOST="10.0.0.1" ./get.sh -l 5 -t foo1
```

## Retrieve notifications.

```bash
$ ./get.sh [options]
```

### Options:
- `-r`: Requeues all retrieved messages.
- `-n number`: Retrieves `number` messages.
- `-t topic: Topic.`

## Upload notifications.

```bash
$ ./post.sh [-t topic] data
```

Data should be escaped to work in BASH. The content type could be defined in the configuration file, by default
`application/json`.

