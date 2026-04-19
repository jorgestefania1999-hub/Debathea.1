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
const Message = mongoose.model("Message", {
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

// Debates
const Debate = mongoose.model("Debate", {
  titulo: String,
  descripcion: String,
  creadoEn: { type: Date, default: Date.now }
});

// 🔹 ESTADO EN MEMORIA (para tiempo real)
let debate = {
  users: [],
  messages: [],
  turn: 0,
};

// 🔹 SOCKET.IO
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
      text
    };

    debate.messages.push(msg);

    try {
      await Message.create(msg);
    } catch (err) {
      console.log("Error guardando mensaje:", err);
    }

    debate.turn = debate.turn === 0 ? 1 : 0;

    io.emit("state", debate);
  });

  socket.on("disconnect", () => {
    debate.users = debate.users.filter(u => u.id !== socket.id);
    debate.turn = 0;
    io.emit("state", debate);
  });

});

// 🔹 API REST

// Test
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Crear debate
app.post("/debates", async (req, res) => {
  try {
    const nuevoDebate = new Debate(req.body);
    await nuevoDebate.save();
    res.json(nuevoDebate);
  } catch (error) {
    res.status(500).json({ error: "Error al crear debate" });
  }
});

// Obtener debates
app.get("/debates", async (req, res) => {
  try {
    const debates = await Debate.find();
    res.json(debates);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener debates" });
  }
});

// 🔹 SERVER
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
