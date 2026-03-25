FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx-http.conf /etc/nginx/conf.d/00-buffers.conf

EXPOSE 80

CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template \
   > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
