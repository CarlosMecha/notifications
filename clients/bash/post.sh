
#
# Uploads a notification to the server.
# 
# See 'conf.sh'.
# 

. conf.sh

function help() {
    echo "Usage: ./post.sh <topic> <data>"
}

if [ "$#" -ne 2 ]; then {
    help;
    exit 1;
} fi;

TOPIC="$1";
DATA="$2";

$CURL -H "Content-Type: $CONTENT_TYPE" -X POST -d "$DATA" "http://$HOST:$PORT/$TOPIC";

RES="$?";

echo;

exit $RES;

