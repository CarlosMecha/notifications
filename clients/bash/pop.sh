
. conf.sh

TOPIC=$1;
LIMIT=$2;

if [ "x$LIMIT" == "x" ]; then {
    LIMIT=1;
} fi;

curl "http://$HOST:$PORT/$TOPIC?limit=$LIMIT";

echo;

