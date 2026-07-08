FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_REST_BASE_URL=https://monitoring-suspicious-discussions-on-online-plat-production.up.railway.app
ENV VITE_REST_BASE_URL=$VITE_REST_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

ENV PORT=3000

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
