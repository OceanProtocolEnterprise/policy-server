# Use Ubuntu as the base image and install only required dependencies
FROM ubuntu:22.04 AS base
RUN apt-get update && apt-get -y install curl git

# Set up NVM and Node.js
ENV NVM_DIR=/usr/local/nvm \
    NODE_VERSION=v20.16.0
RUN mkdir -p $NVM_DIR \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default \ 
    && ln -s $NVM_DIR/versions/node/$NODE_VERSION/bin/node /usr/local/bin/node \
    && ln -s $NVM_DIR/versions/node/$NODE_VERSION/bin/npm /usr/local/bin/npm

# Builder stage to install dependencies and compile TypeScript
FROM base AS builder
WORKDIR /usr/src/app

# Explicitly copy package.json and package-lock.json
COPY package.json package-lock.json ./
RUN npm install  

# Copy the rest of the application files and build TypeScript
COPY . .  
RUN npm run build  # Build the project (compiles TypeScript)

# Runner stage
FROM base AS runner
COPY . /usr/src/app
WORKDIR /usr/src/app/
COPY --from=builder /usr/src/app/node_modules/ /usr/src/app/node_modules/
RUN npm run build
# Expose necessary ports
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production 
# Run the application directly from the dist directory
CMD ["npm","run","start"]
