const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema(
  {
    name: String,
    episodeNumber: Number,
    image: String,
    videoType: { type: Number, default: 0 }, //0:YoutubeUrl 1:m3u8Url 2:MP4 3:MKV 4:WEBM 5:Embed 6:File
    videoUrl: { type: String, default: "" },
    seasonNumber: Number,
    TmdbMovieId: String,
    runtime: { type: String, default: null },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Episode", EpisodeSchema);
