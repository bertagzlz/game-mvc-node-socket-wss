FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app will run on
EXPOSE 4111

# Run the app
CMD [ "node", "build/index.js" ]
# build and run with docker
# Create image: `docker build -t wss-server .`
#Run: `docker run -p 4111:4111 wss-server:latest`