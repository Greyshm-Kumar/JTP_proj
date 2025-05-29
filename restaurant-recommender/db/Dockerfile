FROM postgres:13-alpine
COPY init.sql /docker-entrypoint-initdb.d/
COPY restaurants.csv /docker-entrypoint-initdb.d/