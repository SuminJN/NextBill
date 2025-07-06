# Multi-stage build for React
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextbill -u 1001

# Change ownership
RUN chown -R nextbill:nodejs /usr/share/nginx/html
RUN chown -R nextbill:nodejs /var/cache/nginx
RUN chown -R nextbill:nodejs /var/log/nginx
RUN chown -R nextbill:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextbill:nodejs /var/run/nginx.pid

USER nextbill

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
