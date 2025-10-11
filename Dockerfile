ARG CONTAINER_REGISTRY_PREFIX=docker.io/

FROM ${CONTAINER_REGISTRY_PREFIX}node:18 as build
RUN mkdir /app-root
WORKDIR /app-root
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN npm install --save
ARG CONFIGURATION=production
ARG BASE_HREF=/metabolights/editor
RUN npm run build -- --configuration $CONFIGURATION --base-href="$BASE_HREF/"

# Stage 2, use the compiled app, ready for production with Nginx
FROM ${CONTAINER_REGISTRY_PREFIX}nginx:1.28
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"
COPY --from=build /app-root/dist/metabolights-editor/browser /editor

ARG EXPOSED_PORT=8008
EXPOSE $EXPOSED_PORT

ENTRYPOINT ["nginx", "-g", "daemon off;"]
