# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/or-scheduler-ui /usr/share/nginx/html
# If the app is deeper (e.g. browser folder), adjust the path above
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
