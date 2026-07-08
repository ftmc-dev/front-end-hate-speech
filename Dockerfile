FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_REST_BASE_URL=https://monitoring-suspicious-discussions-on-online-plat-production.up.railway.app

COPY package*.json vite.config.ts ./
COPY . .

RUN npm install

RUN npm run build
FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /etc/nginx/ssl

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]