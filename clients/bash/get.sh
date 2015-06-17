
#
# Retrieves a number of messages from a single topic.
#
# See 'conf.sh'.
# 
# @param options 
#    -r Requeue after retrieve.
#    -n # Number of messages. Default 1.
# @param $1 Topic
# @param $2 Optional limit
# 
#

. conf.sh

REQUEUE="";
LIMIT="1";

function help(){
    echo "Usage: ./get.sh [options] <topic>";
    echo "Options: -r: redirect; -n \d+: number of messages, default 1.";
}

if [ "$#" == "0" -o "$#" -gt 3 ]; then {
    help;
    exit 1;
} fi;

while (( "$#" )); do {
    case "$1" in
    "-r")
        REQUEUE="&requeue=true";
        ;;
    "-n")
        if [ "$2" -eq "$2" ]; then {
            LIMIT="$2";
        } else {
            help;
            exit 1;
        } fi;
        ;;
    *)
        TOPIC="$1";
    esac;

    shift;

} done;

if [ "x$TOPIC" == "x" ]; then {
    echo "Topic not set.";
    help;
    exit 1;
} fi;

$CURL "http://$HOST:$PORT/$TOPIC?limit=$LIMIT$REQUEUE";

RES="$?";

echo;

exit $RES;

