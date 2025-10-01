FROM postgres:18
COPY bin /packit-bin
ENV PATH="/packit-bin:$PATH"
ENV POSTGRES_DB packit
ENV POSTGRES_USER packituser
ENV POSTGRES_PASSWORD changeme
# This is needed to override the loss of data that happens if you
# don't mount a persistent volume at the mount point.
ENV PGDATA /pgdata

COPY conf /etc/packit

RUN cat /etc/packit/postgresql.conf /etc/packit/postgresql.test.conf.in > \
        /etc/packit/postgresql.test.conf
RUN cat /etc/packit/postgresql.conf /etc/packit/postgresql.production.conf.in > \
        /etc/packit/postgresql.production.conf
RUN chown -R postgres:postgres /etc/packit
RUN ./docker-entrypoint.sh --version

ENTRYPOINT ["/packit-bin/start-with-config.sh"]
CMD ["/etc/packit/postgresql.conf"]
