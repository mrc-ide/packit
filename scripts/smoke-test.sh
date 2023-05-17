#!/usr/bin/env bash
wait_for()
{
    echo "waiting up to $TIMEOUT seconds for API"
    start_ts=$(date +%s)
    for i in $(seq $TIMEOUT); do

        curl localhost:8080/packets/
        result=$?
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            echo "API available after $((end_ts - start_ts)) seconds"
            break
        fi
        sleep 1
        echo "...still waiting"
    done
    return $result
}

docker run --network=host -d mrcide/packit:$BRANCH_NAME

# The variable expansion below is 100s by default, or the argument provided
# to this script
TIMEOUT="${1:-60}"
wait_for
RESULT=$?
if [[ $RESULT -ne 0 ]]; then
  echo "API did not become available in time"
fi
exit $RESULT
