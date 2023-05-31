FROM openjdk:17

COPY ./docker/entrypoint /entrypoint

ADD ./app/build/distributions/app-boot.tar /

# This path is needed for the eventual configuration
RUN mkdir -p /etc/packit

ENTRYPOINT ["/entrypoint"]
