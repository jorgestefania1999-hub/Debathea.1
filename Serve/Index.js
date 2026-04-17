const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Estado del debate (MVP simple)
let debate = {
  users: [],
  messages: [],
  turn: 0,
};

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Agregar usuario
  socket.on("join", (name) => {
    debate.users.push({ id: socket.id, name });
    io.emit("state", debate);
  });

  // Enviar mensaje
  socket.on("message", (data) => {
    const userIndex = debate.users.findIndex(u => u.id === socket.id);

    // Solo permite hablar al usuario en turno
    if (userIndex !== debate.turn) return;

    debate.messages.push({
      user: debate.users[userIndex].name,
      text: data,
    });

    // Cambiar turno
    debate.turn = debate.turn === 0 ? 1 : 0;

    io.emit("state", debate);
  });

  socket.on("disconnect", () => {
    debate.users = debate.users.filter(u => u.id !== socket.id);

    if (debate.turn >= debate.users.length) {
      debate.turn = 0;
    }

    io.emit("state", debate);
  });
});

server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
