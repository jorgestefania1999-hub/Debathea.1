const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔹 Middleware
app.use(express.json());
app.use(express.static("public"));

// 🔹 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// 🔹 MODELOS

// Mensajes
const Message = mongoose
