
. conf.sh

TOPIC=$1;
DATA=$2;

curl -H "Content-Type: application/json" -X POST -d "$DATA" "http://$HOST:$PORT/$TOPIC";

echo;

