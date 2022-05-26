sudo docker stop metabolights-editor
sudo docker rm metabolights-editor
sudo docker run --name metabolights-editor \
    --mount src=$(pwd)/nginx.conf,dst=/etc/nginx/conf.d/default.conf,type=bind \
    -p 8000:8000 \
    dockerhub.ebi.ac.uk/mtbls/apps/metabolights-editor:dev-latest
