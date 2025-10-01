#!/usr/bin/env bash
set -ex
CONFIG_FILE=$1
shift
exec docker-entrypoint.sh $* -c config_file=$CONFIG_FILE
