sudo docker stop metabolights-editor
sudo docker rm metabolights-editor
sudo docker run --name metabolights-editor \
    --mount src=$(pwd)/dist/metabolights-editor,dst=/usr/share/nginx/html/metabolights-editor,type=bind \
    --mount src=$(pwd)/nginx.conf,dst=/etc/nginx/conf.d/default.conf,type=bind \
    -p 8000:8000 \
    metabolights-editor
