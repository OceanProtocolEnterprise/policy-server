#!/bin/bash

# Image and container name
IMAGE_NAME="policy-server"
CONTAINER_NAME="policy-server"
PORT=8000

# Build the image
echo "Building Docker image with the name $IMAGE_NAME..."
docker build -t $IMAGE_NAME:latest .

# Check if a container with the same name exists
if [ $(docker ps -a -q -f name=$CONTAINER_NAME) ]; then
    echo "A container with the name $CONTAINER_NAME already exists. Removing it..."
    docker rm -f $CONTAINER_NAME
fi

# Run the container
echo "Starting container $CONTAINER_NAME on port $PORT..."
docker run --name $CONTAINER_NAME -p $PORT:$PORT $IMAGE_NAME:latest

echo "Container $CONTAINER_NAME is running on port $PORT."
