FROM node:18
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# o ci para las versiones exactas
# Bundle app source
COPY . .
# Compile TypeScript to JavaScript
# RUN npm run build
# Expose the port the app will run on
EXPOSE 8443
## CMD ["npm", "run", "start"]
 ## CMD [ "node", "index.js" ]
CMD ["npm", "run", "develop"]
# build and run with docker
# Create image: `docker build -t wss-server .`
#Run: `docker run -p 8443:8443 wss-server:latest`