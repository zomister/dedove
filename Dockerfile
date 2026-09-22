# Build the Vite app
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve the built files and API
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npi ci --omit=dev
COPY server ./server
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["node", "server/index.js"]
