# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:stable
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"

COPY  dist/metabolights-editor /usr/share/nginx/html/metabolights/editor

EXPOSE 8000

ENTRYPOINT ["nginx", "-g", "daemon off;"]
