const Season = require("./season.model");

//import model
const Movie = require("../movie/movie.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create season manual
exports.store = async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.name ||
      !req.body.seasonNumber ||
      !req.body.episodeCount ||
      !req.body.releaseDate ||
      !req.body.movieId ||
      !req.body.image
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(200).json({ status: false, message: "Movie does not found!!" });

    const season = new Season();

    season.image = req.body.image;
    season.name = req.body.name;
    season.seasonNumber = req.body.seasonNumber;
    season.episodeCount = req.body.episodeCount;
    season.releaseDate = req.body.releaseDate;
    season.movie = movie._id;

    await season.save();

    const data = await Season.findById(season._id).populate("movie", "title");

    return res.status(200).json({
      status: true,
      message: "finally, Season created by admin!",
      season: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//update season
exports.update = async (req, res) => {
  try {
    if (!req.query.seasonId) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const season = await Season.findById(req.query.seasonId);
    if (!season) {
      return res.status(200).json({ status: false, message: "Season does not found!!" });
    }

    season.name = req.body.name ? req.body.name : season.name;
    season.seasonNumber = req.body.seasonNumber ? req.body.seasonNumber : season.seasonNumber;
    season.episodeCount = req.body.episodeCount ? req.body.episodeCount : season.episodeCount;
    season.releaseDate = req.body.releaseDate ? req.body.releaseDate : season.releaseDate;
    season.TmdbSeasonId = req.body.TmdbSeasonId ? req.body.TmdbSeasonId : season.TmdbSeasonId;
    season.movie = req.body.movie ? req.body.movie : season.movie;

    if (season.image) {
      const urlParts = season.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("old image in season update: ", season.image);

      await deleteFromSpace({ folderStructure, keyName });
      season.image = req.body.image ? req.body.image : season.image;

      console.log("new image in season update: ", season.image);
    }

    await season.save();

    const data = await Season.findById(season._id).populate("movie", "title");

    return res.status(200).json({ status: true, message: "finally, Season has been update by admin!", season: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete season
exports.destroy = async (req, res) => {
  try {
    if (!req.query.seasonId) {
      return res.status(200).json({ status: false, message: "SeasonId is required!!" });
    }

    const season = await Season.findById(req.query.seasonId);
    if (!season) {
      return res.status(200).json({ status: false, message: "Season does not found!!" });
    }

    //delete the old image from digitalOcean Spaces
    if (season.image) {
      const urlParts = season.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    await season.deleteOne();

    return res.status(200).json({ status: true, message: "finally, season is deleted by admin!" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all season
exports.get = async (req, res) => {
  try {
    const query = [{ path: "movie", select: ["title", "media_type"] }];

    const season = await Season.find().populate(query).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success!!", season });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//get season particular movieId wise
exports.getIdWise = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(500).json({ status: false, message: "No Movie Was Found!!" });
    }

    const matchQuery = { movie: movie._id };

    const query = [{ path: "movie", select: "title" }];

    const season = await Season.find(matchQuery).populate(query).sort({ seasonNumber: 1 });

    return res.status(200).json({ status: true, message: "Success!!", season });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};
