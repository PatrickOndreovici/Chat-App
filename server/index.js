const express = require("express");
const app = express();

const date = require("date-and-time");
const { v4: uuidv4 } = require("uuid");

const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const connection = require('./utils/WebSockets')

global.io = new Server(server);
global.io.on('connection', connection)


server.listen(5000, () => {
  console.log("listening on *:5000");
});
