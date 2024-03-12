const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema(
  {
    name: { type: String },
    seasonNumber: { type: Number },
    episodeCount: { type: Number },
    image: { type: String },
    releaseDate: { type: String },
    TmdbSeasonId: { type: String, default: null },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Season", seasonSchema);
