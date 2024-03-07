# syntax=docker/dockerfile:1.6.0
# escape=\

# stage-1

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION} as builder

WORKDIR /build

COPY package*.json .
RUN npm install

COPY tsconfig.json tsconfig.json
COPY . .

RUN npm run build

# stage-2

FROM node:${NODE_VERSION} as runner

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder build/dist dist/

EXPOSE 5500

CMD ["npm", "start"]
