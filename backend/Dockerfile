FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci ---omit=dev --no-audit --no-fund\
	&& npm i -g pm2
COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./

CMD [ "pm2-runtime", "start", "ecosystem.config.js"]