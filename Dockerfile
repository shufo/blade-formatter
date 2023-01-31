FROM node:lts-alpine as builder

WORKDIR /blade-formatter
ADD . .
RUN apk add --update --no-cache git python3 gcc g++ make
RUN yarn install && yarn build
RUN ln -s $(pwd)/bin/blade-formatter /usr/local/bin/blade-formatter

ENTRYPOINT ["blade-formatter"]
