FROM node:18 as build
RUN mkdir /app-root
WORKDIR /app-root
COPY . .
RUN npm install --save --legacy-peer-deps
ARG CONFIGURATION=production
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build -- --configuration $CONFIGURATION

# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:stable
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"

COPY --from=build /app-root/dist /usr/share/nginx/html
ARG EXPOSED_PORT=8008
RUN mkdir -p /usr/share/nginx/html/metabolights && mv /usr/share/nginx/html/metabolights-editor/ /usr/share/nginx/html/metabolights/editor
EXPOSE $CONFIGURATION

ENTRYPOINT ["nginx", "-g", "daemon off;"]
