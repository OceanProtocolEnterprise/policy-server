#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="policy-server"
CONTAINER_NAME="policy-server"

LOCAL_PORT=8000 
CONTAINER_PORT=8000
ENV_FILE="$(dirname "$0")/../.env" 

echo "Building Docker image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME:latest" "$(dirname "$0")/.."

if docker ps -a -q -f "name=^/${CONTAINER_NAME}$" >/dev/null; then
  echo "Removing existing container: $CONTAINER_NAME"
  docker rm -f "$CONTAINER_NAME"
fi

if [[ -f "$ENV_FILE" ]]; then
  echo "Loading environment variables from $ENV_FILE and running container in detached mode (-d)"
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$LOCAL_PORT:$CONTAINER_PORT" \
    --env-file "$ENV_FILE" \
    "$IMAGE_NAME:latest"
else
  echo "WARNING: .env file not found at $ENV_FILE, starting without environment variables"
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$LOCAL_PORT:$CONTAINER_PORT" \
    "$IMAGE_NAME:latest"
fi

echo "Container $CONTAINER_NAME is running in detached mode on port $LOCAL_PORT."

if docker ps -q -f "name=^/${CONTAINER_NAME}$" >/dev/null; then
  echo "Successfully started container $CONTAINER_NAME."
else
  echo "ERROR: Failed to start container $CONTAINER_NAME."
fi