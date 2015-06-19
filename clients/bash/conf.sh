#
# Configuration for the bash client.
# These values could be overrided using environment variables.
#

HOST=${HOST:-"127.0.0.1"};
PORT=${PORT:-"3000"};
CONTENT_TYPE=${CONTENT_TYPE:-"application/json"};
CURL=${CURL:-"`which curl`"};

if [ "x$CURL" == "x" ]; then {
    echo "'curl' not found.";
    exit 1;
} fi;

