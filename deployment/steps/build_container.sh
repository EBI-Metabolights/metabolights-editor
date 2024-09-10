#!/bin/bash

FILE_PATH=$(realpath $(dirname "$0"))
echo "Current path: $FILE_PATH"
PARENT_PATH=$(dirname "$FILE_PATH")
echo "Parent path: $PARENT_PATH"
source $PARENT_PATH/configuration.sh "$CI_COMMIT_REF_NAME" "$APP_VERSION"

echo  "CI_REGISTRY $CI_REGISTRY"
docker image prune -f
echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" "$CI_REGISTRY" --password-stdin
if [ $? -eq 0 ]; then
    echo "Docker login successfull "
else
    echo "Docker login failed"
    exit 1
fi

echo {\"version\": \"$APP_VERSION\", \"releaseName\": \"$RELEASE_NAME-$CI_COMMIT_SHORT_SHA\"} > src/assets/configs/version.json


echo "docker build -t $IMAGE_NAME ."
docker build -t $IMAGE_NAME .
if [ $? -eq 0 ]; then
    git status
    echo "Docker build is successfull. Image name: $IMAGE_NAME"
else
    git status
    echo "Docker build task failed. Image name: $IMAGE_NAME"
    exit 1
fi

echo "docker docker build -t $LATEST_IMAGE_NAME ."
docker build -t $LATEST_IMAGE_NAME .

if [ $? -eq 0 ]; then
    git status
    echo "Docker build is successfull. Image name: $LATEST_IMAGE_NAME"
else
    git status
    echo "Docker build task failed. Image name: $LATEST_IMAGE_NAME"
    exit 1
fi

docker push $IMAGE_NAME
if [ $? -eq 0 ]; then
    git status
    echo "Docker push is successfull. Image name: $IMAGE_NAME"
else
    git status
    echo "Docker push task failed. Image name: $IMAGE_NAME"
    exit 1
fi


docker push $LATEST_IMAGE_NAME

if [ $? -eq 0 ]; then
    git status
    echo "Docker push is successfull. Image name: $LATEST_IMAGE_NAME"
else
    git status
    echo "Docker push task failed. Image name: $LATEST_IMAGE_NAME"
    exit 1
fi
