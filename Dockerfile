# Stage 1: Build React + Vite app
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline || npm install

COPY . .
RUN npm run build

# Stage 2: Serve web app using Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Vite web files to Nginx web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

CMD ["nginx", "-g", "daemon off;"]
