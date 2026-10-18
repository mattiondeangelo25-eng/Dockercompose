# Stage 1: Build the application
FROM node:18-alpine AS build

# Set a working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all the application files
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copy the built files from the build stage (Stage 0)
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (nginx default port)
EXPOSE 80

# Start nginx to serve the application
CMD ["nginx", "-g", "daemon off;"]
