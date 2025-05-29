FROM postgres:13-alpine

RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/pg_hba.conf
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/postgresql.conf

COPY init.sql /docker-entrypoint-initdb.d/
COPY restaurants.csv /docker-entrypoint-initdb.d/

EXPOSE 5432