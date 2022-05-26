FROM node:16 as build
RUN mkdir /app-root
WORKDIR /app-root
COPY . .
RUN npm install
ARG configuration=production
RUN npm run build --prod

# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:stable
LABEL maintainer="MetaboLights (metabolights-help @ ebi.ac.uk)"

COPY --from=build /app-root/dist /usr/share/nginx/html

EXPOSE 8000

ENTRYPOINT ["nginx", "-g", "daemon off;"]
