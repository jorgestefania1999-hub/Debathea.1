const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

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

  socket.on("message", async (text) => {
    const index = debate.users.findIndex(u => u.id === socket.id);
    if (index !== debate.turn) return;

    const msg = {
      user: debate.users[index].name,
      const Debate = require("./models/Debate");
      text
    };

    debate.messages.push(msg);

    await Message.create(msg);

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
  app.get("/", (req, res) => {
  res.send("API funcionando");
});
});
