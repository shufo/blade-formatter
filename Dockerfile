FROM node:lts-alpine as builder

WORKDIR /blade-formatter
ADD . .
RUN apk add --update --no-cache git python gcc g++ make && \
    npm install --only=prod
RUN npm rebuild -q && \
    apk del git python gcc g++ make && \
    npm cache clean --force && \
    npm uninstall -g npm && \
    rm -fR ~/.cache ~/.npm && \
    ln -s $(pwd)/bin/blade-formatter /usr/local/bin/blade-formatter

ENTRYPOINT ["blade-formatter"]
