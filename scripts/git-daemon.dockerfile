# This sets up a container image that serves an Orderly source repository as a
# Git repository, for use as a remote repository the runner can fetch.
# The repository is exposed over the Git protocol (port 9418).

FROM ubuntu
RUN apt-get update && apt-get install -y git
COPY orderly_config.yml /srv/git/orderly/
COPY src /srv/git/orderly/src

ENV EMAIL="orderly@orderly.com"
RUN git init /srv/git/orderly
RUN git -C /srv/git/orderly add --all
RUN git -C /srv/git/orderly commit -m 'initial commit'
CMD ["git", "daemon", "--base-path=/srv/git/", "--export-all"]
