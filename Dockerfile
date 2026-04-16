FROM node:24-alpine3.20 as builder
WORKDIR /app
ADD . /app
RUN yarn install && yarn run build

FROM node:24-alpine3.20
WORKDIR /app
ADD . /app
COPY --from=builder /app/dist /app/dist
RUN yarn install --production && \
  yarn cache clean
RUN ln -s $(pwd)/bin/blade-formatter.js /usr/local/bin/blade-formatter

ENTRYPOINT ["blade-formatter"]
