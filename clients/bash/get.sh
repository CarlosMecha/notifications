
#
# Retrieves a number of messages from a single topic.
#
# See 'conf.sh'.
# 
# @param options Optional. 
#    -r Requeue after retrieve.
#    -n # Number of messages. Default 1.
# @param topic Optional.
# 
#

. conf.sh

REQUEUE="";
LIMIT="1";

function help(){
    echo "Usage: ./get.sh [options] [topic]";
    echo "Options: -r: redirect; -n \d+: number of messages, default 1";
}

while (( "$#" )); do {
    case "$1" in
    "-r")
        REQUEUE="&requeue=true";
        ;;
    "-n")
        if [ "$2" -ne "" ]; then {
            LIMIT="$2";
            shift;
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

$CURL "http://$HOST:$PORT/$TOPIC?limit=$LIMIT$REQUEUE";

RES="$?";

echo;

exit $RES;

