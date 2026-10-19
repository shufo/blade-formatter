FROM node:26-alpine3.23 as builder
WORKDIR /app
ADD . /app
RUN npm install && npm run build

FROM node:26-alpine3.23
WORKDIR /app
ADD . /app
COPY --from=builder /app/dist /app/dist
RUN npm ci
RUN ln -s $(pwd)/bin/blade-formatter.js /usr/local/bin/blade-formatter

ENTRYPOINT ["blade-formatter"]
