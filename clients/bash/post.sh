
#
# Uploads a notification to the server.
# 
# See 'conf.sh'.
# 

. conf.sh

function help() {
    echo "Usage: ./post.sh [-t topic] <data>"
}

if [ "$1" == "-t" ]; then {
    if [ "$#" -ne 3 ]; then {
        help;
        exit 1;
    } fi;

    TOPIC="$2";
    DATA="$3";
} else {
    if [ "$#" -ne 1 ]; then {
        help;
        exit 1;
    } fi;
    TOPIC="";
    DATA="$1";
} fi;


$CURL -H "Content-Type: $CONTENT_TYPE" -X POST -d "$DATA" "http://$HOST:$PORT/$TOPIC";

RES="$?";

echo;

exit $RES;

