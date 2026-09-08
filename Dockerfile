# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build production assets
COPY . .
RUN npm run build

# Production Static Server Stage
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|svg|woff2?)$ {\n\
        expires 6M;\n\
        access_log off;\n\
        add_header Cache-Control "public";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
