#!/bin/bash
set -euo pipefail

# Loading envs
ENV_FILE="$(dirname "$0")/../.env"

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: Environment file not found at $ENV_FILE. Aborting."
    exit 1
  fi
  echo "Loading variables from $ENV_FILE into Bash environment..."
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    value="${value%\"}"; value="${value#\"}"
    export "$key"="$value"
  done < "$ENV_FILE"
}
load_env

: "${SSH_PORT:=22}"
echo "Using SSH Port: $SSH_PORT"


# Create local image
TAR_NAME="${IMAGE_NAME}.tar"
GZ_NAME="${TAR_NAME}.gz"

echo "Building docker image: $IMAGE_NAME"
docker build -t "${IMAGE_NAME}:latest" "$(dirname "$0")/.."

echo "Exporting docker build image..."
docker save -o "$TAR_NAME" "${IMAGE_NAME}:latest"

echo "Zipping docker image..."
gzip -f "$TAR_NAME"


# Server transmitting
echo "Transmitting image  to server ${SERVER_USER}@${SERVER_IP}:${SSH_PORT}..."
scp -i "$SSH_KEY" -P "$SSH_PORT" "$GZ_NAME" "$ENV_FILE" "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}"

#  Server running
echo "Running commands on server..."
ssh -i "$SSH_KEY" -p "$SSH_PORT" \
  "${SERVER_USER}@${SERVER_IP}" \
  "REMOTE_PATH='${REMOTE_PATH}' GZ_NAME='${GZ_NAME}' TAR_NAME='${TAR_NAME}' CONTAINER_NAME='${CONTAINER_NAME}' IMAGE_NAME='${IMAGE_NAME}' LOCAL_PORT='${LOCAL_PORT}' CONTAINER_PORT='${CONTAINER_PORT}' bash -s" <<'EOF'
set -euo pipefail

REMOTE_GZ_PATH="${REMOTE_PATH}/${GZ_NAME}"
REMOTE_TAR_PATH="${REMOTE_PATH}/${TAR_NAME}"
REMOTE_ENV_PATH="${REMOTE_PATH}/.env"

echo "Unzip tar.gz..."
gunzip -f "$REMOTE_GZ_PATH"

echo "Importing docker image..."
docker load -i "$REMOTE_TAR_PATH"

echo "Deleting old container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting new container with --env-file..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$LOCAL_PORT:$CONTAINER_PORT" \
  --env-file "$REMOTE_ENV_PATH" \
  "$IMAGE_NAME:latest"

echo "Checking container status..."
if docker ps -q -f "name=^/${CONTAINER_NAME}$" >/dev/null; then
  echo "Successfully started container $CONTAINER_NAME."
else
  echo "ERROR: Failed to start container $CONTAINER_NAME."
  docker logs "$CONTAINER_NAME" || true
fi

echo "Deleting temporary data on server..."
rm -f "$REMOTE_TAR_PATH" "$REMOTE_ENV_PATH"
EOF

# 5)Local clear
echo "Deleting temporary data locally..."
rm -f "$GZ_NAME"

echo "Done! Container $CONTAINER_NAME is running on $SERVER_IP:$LOCAL_PORT."
