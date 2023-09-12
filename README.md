# node-wss-server
Websocket over TLS server example in node js

# How to create certificate files

- Step 0:
Delete old certificate files `cert.pem`, `key.pem`

- Step 1:
Create certificates with: `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes` key.pem is the private key

# build and run 
Step 1:
run server with: `npm run start`

# build and run with docker
- Step 1: 
Create image: `docker build -t wss-server .`

- Step 2:
Run: `docker run -p 8080:8080 wss-server:latest`

# Test with simple client
Run client with 
`const wss = new WebSocket('wss://localhost:8080');
    wss.onerror = err => console.log(err);
    wss.onmessage = msg => console.log(msg.data);
    wss.onopen = () => wss.send('Hello from client');
    `

You can send additional messages from client with: `wss.send('Hello from client');`