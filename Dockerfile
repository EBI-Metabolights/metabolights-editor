# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:stable
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"

COPY  dist/metabolights-editor /data/metabolights/editor
RUN rm -rf /usr/share/nginx/html/*
EXPOSE 8000

ENTRYPOINT ["nginx", "-g", "daemon off;"]
