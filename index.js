const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log("Error Mongo:", err));

// 📦 Modelo de mensaje
const MessageSchema = new mongoose.Schema({
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

// 📁 Archivos estáticos (frontend)
app.use(express.static("public"));

// 📊 Estado del debate (en memoria)
let debate = {
  users: [],
  messages: [],
  turn: 0,
};

// 🔌 Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join", (name) => {
    debate.users.push({ id: socket.id, name });
    io.emit("state", debate);
  });

  socket.on("message", async (text) => {
    const index = debate.users.findIndex(u => u.id === socket.id);

    // ⛔ Solo habla el que tiene el turno
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

    // 🔄 Cambia turno
    debate.turn = debate.turn === 0 ? 1 : 0;

    io.emit("state", debate);
  });

  socket.on("disconnect", () => {
    debate.users = debate.users.filter(u => u.id !== socket.id);
    debate.turn = 0;
    io.emit("state", debate);
    console.log("Usuario desconectado:", socket.id);
  });
});

// 🌐 Ruta básica
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// 🚀 Puerto (IMPORTANTE para Render)
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});