const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String },
    message: { type: String },
    image: { type: String },
    date: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
