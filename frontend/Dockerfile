# Multi-stage build for React
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies with npm cache optimization
RUN npm ci --prefer-offline --no-audit

# Copy source and build with optimizations
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=4096" \
    NODE_ENV=production \
    npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp

# Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextbill -u 1001 -G nodejs

# Change ownership of necessary directories
RUN chown -R nextbill:nodejs /usr/share/nginx/html
RUN chown -R nextbill:nodejs /var/cache/nginx
RUN chown -R nextbill:nodejs /var/log/nginx
RUN chown -R nextbill:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextbill:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextbill

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
