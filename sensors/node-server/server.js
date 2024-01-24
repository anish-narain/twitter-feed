const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send(`Echo: ${message}`);
    });

    ws.send('Connected to WebSocket server');
});

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
