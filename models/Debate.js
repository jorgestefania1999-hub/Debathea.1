const mongoose = require("mongoose");

const debateSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Debate", debateSchema);
