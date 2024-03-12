//Mongoose
const mongoose = require("mongoose");

//Role Schema
const roleSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    position: { type: String },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", roleSchema);
