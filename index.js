const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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

  socket.on("message", (text) => {
    const index = debate.users.findIndex(u => u.id === socket.id);
    if (index !== debate.turn) return;

    debate.messages.push({
      user: debate.users[index].name,
      text
    });

    debate.turn = debate.turn === 0 ? 1 : 0;

    io.emit("state", debate);
  });

  socket.on("disconnect", () => {
    debate.users = debate.users.filter(u => u.id !== socket.id);
    debate.turn = 0;
    io.emit("state", debate);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
