const Episode = require("./episode.model");

//mongoose
const mongoose = require("mongoose");

//import model
const Movie = require("../movie/movie.model");
const Season = require("../season/season.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create episode
exports.store = async (req, res) => {
  try {
    if (
      req.body &&
      req.body.name &&
      req.body.episodeNumber &&
      req.body.season &&
      req.body.movieId &&
      req.body.videoType &&
      req.body.videoUrl &&
      req.body.image
    ) {
      if (!req.body.movieId || !req.body.season)
        return res.status(200).json({ status: false, message: "movieId and seasonId must be requried!!" });

      const movie = await Movie.findById(req.body.movieId);
      if (!movie) return res.status(200).json({ status: false, message: "Movie does not found!!" });

      const season = await Season.findById(req.body.season);
      if (!season) return res.status(200).json({ status: false, message: "Season does not found!!" });

      const episode = new Episode();

      episode.videoUrl = req.body.videoUrl;
      episode.image = req.body.image;
      episode.name = req.body.name;
      episode.episodeNumber = req.body.episodeNumber;
      episode.videoType = req.body.videoType;
      episode.movie = movie._id;
      episode.season = season._id;

      season.episodeCount += 1;
      await season.save();

      // if (!movie.season.includes(req.body.season)) {
      //   movie.season.push(req.body.season);
      //   await movie.save();
      // }

      await episode.save(async (error, episode) => {
        if (error) {
          return res.status(200).json({ status: false, message: "Server Error!!" });
        } else {
          const data = await Episode.aggregate([
            {
              $match: { _id: episode._id },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "movies",
                localField: "movie",
                foreignField: "_id",
                as: "movie",
              },
            },
            {
              $unwind: {
                path: "$movie",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $project: {
                name: 1,
                episodeNumber: 1,
                seasonNumber: 1,
                season: 1,
                runtime: 1,
                videoType: 1,
                videoUrl: 1,
                image: 1,
                TmdbMovieId: 1,
                createdAt: 1,
                title: "$movie.title",
                movieId: "$movie._id",
              },
            },
          ]);

          return res.status(200).json({
            status: true,
            message: "Episode Added Successfully!!",
            Episode: data[0],
          });
        }
      });
    } else {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update episode
exports.update = async (req, res) => {
  try {
    const episode = await Episode.findById(req.query.episodeId);
    if (!episode) {
      return res.status(200).json({ status: false, message: "episode does not found!!" });
    }

    episode.name = req.body.name ? req.body.name : episode.name;
    episode.runtime = req.body.runtime ? req.body.runtime : episode.runtime;
    episode.videoType = req.body.videoType ? req.body.videoType : episode.videoType;
    episode.episodeNumber = req.body.episodeNumber ? req.body.episodeNumber : episode.episodeNumber;
    episode.movie = req.body.movie ? req.body.movie : episode.movie;
    episode.season = req.body.season ? req.body.season : episode.season;
    //episode.season = req.body.season ? req.body.season.split(",") : episode.season;

    //if (req.files.image) {
    //   if (fs.existsSync(episode.image)) {
    //     fs.unlinkSync(episode.image);
    //   }
    //   episode.image = config.baseURL + req.files.image[0].path;
    //}

    //if (req.files.videoUrl || req.body.videoUrl) {
    //   if (req.files.videoUrl) {
    //     const episode_ = episode.videoUrl.split("storage");
    //     if (episode_) {
    //       if (fs.existsSync("storage" + episode_[1])) {
    //         fs.unlinkSync("storage" + episode_[1]);
    //       }

    //       episode.videoUrl = config.baseURL + req.files.videoUrl[0].path;
    //     }
    //   } else {
    //     episode.videoUrl = req.body.videoUrl;
    //   }
    //}

    //delete the old image and videoUrl from digitalOcean Spaces
    if (req.body.image) {
      const urlParts = episode.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      episode.image = req.body.image ? req.body.image : episode.image;
    }

    if (req.body.videoUrl) {
      const urlParts = episode.videoUrl.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      episode.videoUrl = req.body.videoUrl ? req.body.videoUrl : episode.videoUrl;
    }

    //old seasonId
    const episodeData = await Episode.findOne({ _id: episode._id });
    const oldSeasonId = episodeData.season;
    const oldSeasonData = await Season.findById(oldSeasonId);
    //console.log("old*--------", oldSeasonData);

    //new seasonId
    const NewSeasonData = await Season.findById(req.body.season);
    //console.log("new*--------", NewSeasonData);

    oldSeasonData.episodeCount -= 1;
    await oldSeasonData.save();

    NewSeasonData.episodeCount += 1;
    await NewSeasonData.save();

    await episode.save(async (error, episode) => {
      if (error) {
        return res.status(200).json({ status: false, message: "Server Error!!" });
      } else {
        const data = await Episode.aggregate([
          {
            $match: { _id: episode._id },
          },
          {
            $lookup: {
              from: "movies",
              localField: "movie",
              foreignField: "_id",
              as: "movie",
            },
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              name: 1,
              episodeNumber: 1,
              seasonNumber: 1,
              season: 1,
              runtime: 1,
              videoType: 1,
              videoUrl: 1,
              image: 1,
              title: "$movie.title",
              movieId: "$movie._id",
            },
          },
        ]);

        return res.status(200).json({
          status: true,
          message: "Episode Updated Successfully!!",
          episode: data[0],
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get episode
exports.get = async (req, res) => {
  try {
    const episode = await Episode.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          videoType: 1,
          videoUrl: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          episodeNumber: 1,
          TmdbMovieId: 1,
          createdAt: 1,
          title: "$movie.title",
          movieId: "$movie._id",
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success!!", episode });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete episode
exports.destroy = async (req, res) => {
  try {
    const episode = await Episode.findById(mongoose.Types.ObjectId(req.query.episodeId));
    if (!episode) {
      return res.status(200).json({ status: false, message: "Episode does not found!!" });
    }

    // if (req.files || req.body) {
    //   const deleteVideo = episode.videoUrl.split("storage");

    //   if (deleteVideo) {
    //     if (fs.existsSync("storage" + deleteVideo[0])) {
    //       fs.unlinkSync("storage" + deleteVideo[0]);
    //     }
    //   }

    //   const deleteImage = episode.image.split("storage");

    //   if (deleteImage) {
    //     if (fs.existsSync("storage" + deleteImage[0])) {
    //       fs.unlinkSync("storage" + deleteImage[0]);
    //     }
    //   }
    // }

    //delete the old image and videoUrl from digitalOcean Spaces
    if (episode.image) {
      const urlParts = episode.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (episode.videoUrl) {
      const urlParts = episode.videoUrl.split("/");
      const keyName = urlParts.pop();
      const folderStructure = urlParts.slice(3).join("/");

      await deleteFromSpace({ folderStructure, keyName });
    }

    const episodeData = await Episode.findOne({ _id: episode._id });
    const seasonId = episodeData.season;
    await Season.updateOne({ _id: seasonId }, { $inc: { episodeCount: -1 } });

    await episode.deleteOne();

    return res.status(200).json({ status: true, message: "finally, episode deleted Successfully!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get season wise episode for admin panel
exports.seasonWiseEpisode = async (req, res) => {
  try {
    const movie = await Movie.findById(req.query.movieId);
    if (!movie) return res.status(200).json({ status: false, message: "No Movie Was Found!!" });

    const season = await Season.findOne({
      _id: mongoose.Types.ObjectId(req?.query?.seasonId?.trim()),
    });

    if (req.query.seasonId) {
      if (req.query.seasonId === "AllSeasonGet") {
        const episode = await Episode.aggregate([
          {
            $match: {
              movie: movie._id,
            },
          },
          { $sort: { seasonNumber: 1, episodeNumber: 1 } },
          {
            $lookup: {
              from: "movies",
              localField: "movie",
              foreignField: "_id",
              as: "movie",
            },
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              name: 1,
              image: 1,
              videoType: 1,
              videoUrl: 1,
              episodeNumber: 1,
              seasonNumber: 1,
              TmdbMovieId: 1, //show_id
              createdAt: 1,
              title: "$movie.title",
              movieId: "$movie._id",
            },
          },
        ]);

        return res.status(200).json({
          status: true,
          message: "finally, get all season's episodes!",
          episode,
        });
      } else {
        if (!season) return res.status(200).json({ status: false, message: "No Season Was Found!!" });

        const episode = await Episode.aggregate([
          {
            $match: {
              $and: [{ movie: movie._id }, { season: season._id }],
            },
          },
          {
            $sort: { episodeNumber: 1 },
          },
          {
            $lookup: {
              from: "movies",
              localField: "movie",
              foreignField: "_id",
              as: "movie",
            },
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              episodeNumber: 1,
              seasonNumber: 1,
              season: 1,
              runtime: 1,
              TmdbMovieId: 1, //show_id
              videoType: 1,
              videoUrl: 1,
              image: 1,
              movieId: "$movie._id",
              title: "$movie.title",
            },
          },
        ]);

        return res.status(200).json({
          status: true,
          message: "finally, get Season Wise episodes!",
          episode,
        });
      }
    } else {
      return res.status(200).json({ status: true, message: "seasonId is requried!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get season wise episode for android
exports.seasonWiseEpisodeAndroid = async (req, res) => {
  try {
    const movie = await Movie.findById(req.query.movieId);
    if (!movie) return res.status(200).json({ status: false, message: "No Movie Was Found!!" });

    const episode = await Episode.aggregate([
      {
        $match: {
          $and: [{ movie: movie._id }, { seasonNumber: parseInt(req.query.seasonNumber) }],
        },
      },
      {
        $sort: { episodeNumber: 1 },
      },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          episodeNumber: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          TmdbMovieId: 1, //show_id
          videoType: 1,
          videoUrl: 1,
          image: 1,
          movieId: "$movie._id",
          title: "$movie.title",
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "finally, get season wise episode!", episode });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get movie only if type web series
exports.getSeries = async (req, res) => {
  try {
    var matchQuery;
    if (req.query.type === "SERIES") {
      matchQuery = { media_type: "tv" };
    }

    const movie = await Movie.find(matchQuery).sort({
      createdAt: 1,
    });

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};
