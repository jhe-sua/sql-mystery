FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt-get update && \
    apt-get install -y postgresql postgresql-contrib postgresql-client

RUN service postgresql start