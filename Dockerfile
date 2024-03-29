FROM node:18 as build
RUN mkdir /app-root
WORKDIR /app-root
COPY . .
RUN npm install --save --legacy-peer-deps
ARG CONFIGURATION=production
ARG BASE_HREF=/metabolights/editor
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build -- --configuration $CONFIGURATION --base-href="$BASE_HREF/"

# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:stable
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"
COPY --from=build /app-root/dist/metabolights-editor /editor

ARG EXPOSED_PORT=8008
EXPOSE $EXPOSED_PORT

ENTRYPOINT ["nginx", "-g", "daemon off;"]
