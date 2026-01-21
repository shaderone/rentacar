# -----------------------------------------------------------------------------
# STAGE 1: The Build Stage (Heavy Lift)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependencies first (Layer Caching)
COPY package*.json ./
RUN npm install

# Copy source code and build the React app
COPY . .

# 1. Accept the argument from Docker Compose
ARG VITE_API_URL
# 2. Make it available to the build process
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: The Production Stage (Lightweight)
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (we will create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Standard Web Port)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]