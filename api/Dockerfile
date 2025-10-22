FROM eclipse-temurin:21

COPY ./docker/entrypoint /entrypoint

ADD ./app/build/distributions/app-boot.tar /

ENTRYPOINT ["/entrypoint"]
