FROM node:22-alpine3.20 as builder
WORKDIR /app
ADD . /app
RUN yarn install && yarn run build

FROM node:21-alpine3.17
WORKDIR /app
ADD . /app
COPY --from=builder /app/dist /app/dist
RUN yarn install --production
RUN ln -s $(pwd)/bin/blade-formatter /usr/local/bin/blade-formatter

ENTRYPOINT ["blade-formatter"]
