const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// 📦 Modelo de mensajes
const Message = mongoose.model("Message", {
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

app.use(express.static("public"));

let debate = {
  users: [],
  messages: [],
  turn: 0,
};

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    debate.users.push({ id: socket.id, name });
    io.emit("state", debate);
  });

  socket
