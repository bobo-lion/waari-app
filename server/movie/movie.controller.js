//movie model
const Movie = require("./movie.model");

//mongoose
const mongoose = require("mongoose");

//axios
const axios = require("axios");

//import config
const config = require("../../config");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//notification
const Notification = require("../notification/notification.model");

//import model
const User = require("../user/user.model");
const Region = require("../region/region.model");
const Genre = require("../genre/genre.model");
const Download = require("../download/download.model");
const Favorite = require("../favorite/favorite.model");
const Episode = require("../episode/episode.model");
const Trailer = require("../trailer/trailer.model");
const Role = require("../role/role.model");
const Rating = require("../rating/rating.model");
const Season = require("../season/season.model");

//FCM node
var FCM = require("fcm-node");
var fcm = new FCM(config.SERVER_KEY);

//youtubeUrl
const youtubeUrl = "https://www.youtube.com/watch?v=";

//imageUrl
const imageUrl = "https://www.themoviedb.org/t/p/original";

//manual create movie by admin
exports.store = async (req, res) => {
  try {
    if (
      req.body.title &&
      req.body.year &&
      req.body.description &&
      req.body.region &&
      req.body.genre &&
      req.body.type &&
      req.body.runtime &&
      req.body.videoType &&
      req.body.trailerVideoType &&
      req.body.trailerType &&
      req.body.trailerName &&
      req.body.image &&
      req.body.thumbnail &&
      req.body.trailerImage &&
      req.body.link &&
      req.body.trailerVideoUrl
    ) {
      const region = await Region.findById(req.body.region);
      if (!region) return res.status(200).json({ status: false, message: "Region does not found!" });

      const genre = await Genre.findById(req.body.genre);
      if (!genre) return res.status(200).json({ status: false, message: "Genre does not found!" });

      const movie = new Movie();

      movie.videoType = req.body.videoType;
      movie.link = req.body.link;
      movie.image = req.body.image;
      movie.thumbnail = req.body.thumbnail;
      movie.title = req.body.title;
      movie.runtime = req.body.runtime;
      movie.year = req.body.year;
      movie.description = req.body.description;
      movie.type = req.body.type;
      movie.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      movie.region = region._id;
      movie.media_type = "movie";

      //genre
      const multipleGenre = req.body.genre.toString().split(",");
      movie.genre = multipleGenre;

      //trailer create
      const trailer = new Trailer();

      trailer.videoType = req.body.trailerVideoType;
      trailer.videoUrl = req.body.trailerVideoUrl;
      trailer.trailerImage = req.body.trailerImage;
      trailer.name = req.body.trailerName;
      trailer.type = req.body.trailerType;
      trailer.movie = movie._id;

      await trailer.save();

      await movie.save();

      const data = await Movie.findById(movie._id).populate([
        { path: "region", select: "name" },
        { path: "genre", select: "name" },
      ]);

      //New release movie related notification.....
      const userId = await User.find({
        "notification.NewReleasesMovie": true,
      }).distinct("_id");

      await userId.map(async (id) => {
        const notification = new Notification();

        notification.title = movie.title;
        notification.message = `${movie.title} is Here! Don't Miss It!`;
        notification.userId = id;
        notification.movieId = movie._id;
        notification.image = movie.image;
        notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

        await notification.save();
      });

      const userFCM = await User.find({
        "notification.NewReleasesMovie": true,
      }).distinct("fcmToken");

      console.log("fcmToken:   ", userFCM);

      const payload = {
        registration_ids: userFCM,
        notification: {
          title: `New Release`,
          body: "Stay Tuned: New Movie Alert!",
        },
      };

      await fcm.send(payload, function (error, response) {
        if (error) {
          console.log("Something has gone wrong:  ", error);
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });

      return res.status(200).json({
        status: true,
        message: "finally, movie has been uploaded by admin!",
        movie: data,
      });
    } else {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//manual create web series by admin
exports.storeSeries = async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.title ||
      !req.body.year ||
      !req.body.description ||
      !req.body.region ||
      !req.body.genre ||
      !req.body.type ||
      !req.body.trailerVideoType ||
      !req.body.trailerType ||
      !req.body.trailerName ||
      !req.body.image ||
      !req.body.thumbnail ||
      !req.body.trailerImage ||
      !req.body.trailerVideoUrl
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }
    const region = await Region.findById(req.body.region);
    if (!region) return res.status(200).json({ status: false, message: "Region not found!" });

    const genre = await Genre.findById(req.body.genre);
    if (!genre) return res.status(200).json({ status: false, message: "Genre not found!" });

    const movie = new Movie();

    movie.image = req.body.image;
    movie.thumbnail = req.body.thumbnail;
    movie.title = req.body.title;
    movie.year = req.body.year;
    movie.description = req.body.description;
    movie.type = req.body.type;
    movie.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    movie.region = region._id;
    movie.media_type = "tv";

    //genre
    const multipleGenre = req.body.genre.toString().split(",");
    movie.genre = multipleGenre;

    //trailer create
    const trailer = new Trailer();

    trailer.videoType = req.body.trailerVideoType;
    trailer.videoUrl = req.body.trailerVideoUrl;
    trailer.trailerImage = req.body.trailerImage;
    trailer.name = req.body.trailerName;
    trailer.type = req.body.trailerType;
    trailer.movie = movie._id;

    await trailer.save();

    await movie.save();

    const data = await Movie.findById(movie._id).populate([
      { path: "region", select: "name" },
      { path: "genre", select: "name" },
    ]);

    //New release movie related notification.....
    const userId = await User.find({
      "notification.NewReleasesMovie": true,
    }).distinct("_id");

    await userId.map(async (id) => {
      const notification = new Notification();

      notification.title = movie.title;
      notification.message = `Get Ready to Binge: New ${movie.title} Added Today!`;
      notification.userId = id;
      notification.movieId = movie._id;
      notification.image = movie.image;
      notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      await notification.save();
    });

    const userFCM = await User.find({
      "notification.NewReleasesMovie": true,
    }).distinct("fcmToken");

    console.log("fcmToken in webSeries:  ", userFCM);

    const payload = {
      registration_ids: userFCM,
      notification: {
        title: `New Release`,
        body: "Get Ready: Latest WebSeries Watchlist is Here!",
      },
    };

    await fcm.send(payload, function (error, response) {
      if (error) {
        console.log("Something has gone wrong!!", error);
      } else {
        res.status(200);
        // .json({
        //   status: true,
        //   message: "Successfully sent message",
        // });
        console.log("Successfully sent with response: ", response);
      }
    });

    return res.status(200).json({
      status: true,
      message: "WebSeries Created Successfully!!",
      movie: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get details IMDB id or title wise for admin panel
exports.getStoredetails = async (req, res) => {
  try {
    if ((!req.query.title || !req.query.IMDBid) && !req.query.type) {
      return res.status(200).json({
        status: false,
        message: "Oops !! Invalid details!!",
      });
    }

    if (req.query.title) {
      await axios
        //https://api.themoviedb.org/3/search/movie?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US&page=1&include_adult=false&query=titanic
        .get(
          `https://api.themoviedb.org/3/search/${
            req.query.type === "WEBSERIES" ? "tv" : "movie"
          }?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US&page=1&include_adult=false&query=${req.query.title}`
        )
        .then(async (result) => {
          if (
            (req.query.type === "WEBSERIES" && result.data.results.length === 0) ||
            (req.query.type === "MOVIE" && result.data.results.length === 0)
          ) {
            return res.status(200).json({
              status: "false",
              message: "title and type are passed in query is invalid!!",
            });
          } else {
            //get trailer API call
            var trailerUrl;
            await axios
              //https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
              .get(
                ` https://api.themoviedb.org/3/${req.query.type === "WEBSERIES" ? "tv" : "movie"}/${
                  req.query.type === "WEBSERIES" ? result.data.results[0].id : result.data.results[0].id
                }/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
              )
              .then(async (response) => {
                //console.log("trailer----", response.data);
                trailerUrl = youtubeUrl + response.data.results[0]?.key;
              })
              .catch((error) => console.log(error));

            if (req.query.type === "WEBSERIES") {
              var series = {
                title: result.data.results[0].name,
                description: result.data.results[0].overview,
                year: result.data.results[0].first_air_date,
                image: imageUrl + result.data.results[0].backdrop_path,
                thumbnail: imageUrl + result.data.results[0].poster_path,
                media_type: result.data.results[0].media_type,
                TmdbMovieId: result.data.results[0].id,
                genre: result.data.results[0].genre_ids,
                region: result.data.results[0].origin_country,
                trailerUrl,
              };

              //genre for series
              const genreIds = await result.data.results[0].genre_ids.map(async (id) => {
                const genere = await Genre.findOne({ uniqueId: id });
                return genere;
              });

              await Promise.all(genreIds).then(function (results) {
                series.genre = results;
              });

              //region for series
              const regionIds = await result.data.results[0].origin_country.map(async (id) => {
                const region = await Region.findOne({ uniqueId: id });
                return region;
              });

              await Promise.all(regionIds).then(function (results) {
                series.region = results;
              });

              //console.log("series---", series);
            } else {
              var movie = {
                title: result.data.results[0].title,
                description: result.data.results[0].overview,
                year: result.data.results[0].release_date,
                image: imageUrl + result.data.results[0].backdrop_path,
                thumbnail: imageUrl + result.data.results[0].poster_path,
                media_type: result.data.results[0].media_type,
                TmdbMovieId: result.data.results[0].id,
                genre: result.data.results[0].genre_ids,
                //region: result.data.results[0].origin_country,
                trailerUrl,
              };

              //genre for movie
              const genreIds = await result.data.results[0].genre_ids.map(async (id) => {
                const genere = await Genre.findOne({ uniqueId: id });
                return genere;
              });

              await Promise.all(genreIds).then(function (results) {
                movie.genre = results;
              });

              //region for movie
              // const regionIds =
              //   await result.data.results[0].origin_country.map(
              //     async (id) => {
              //       const region = await Region.findOne({ uniqueId: id });
              //       return region._id;
              //     }
              //   );
              // await Promise.all(regionIds).then(function (results) {
              //   movie.region = results;
              // });
              //console.log("movie---", movie);
            }
            return res.status(200).json({ status: true, message: "Success!!!", movie, series });
          }
        })
        .catch((error) => console.log(error));
    } else if (req.query.IMDBid) {
      //IMDB id Wise API called
      await axios
        .get(
          `https://api.themoviedb.org/3/find/${req.query.IMDBid}?api_key=10471161c6c1b74f6278ff73bfe95982&language=en&external_source=imdb_id`
        )
        .then(async (result) => {
          if (
            (req.query.type === "WEBSERIES" && result.data.tv_results.length === 0) ||
            (req.query.type === "MOVIE" && result.data.movie_results.length === 0)
          ) {
            return res.status(200).json({
              status: "false",
              message: "IMDBid and type are passed in query is invalid!!",
            });
          } else {
            //get trailer API call
            var trailerUrl;
            await axios
              //https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
              .get(
                ` https://api.themoviedb.org/3/${req.query.type === "WEBSERIES" ? "tv" : "movie"}/${
                  req.query.type === "WEBSERIES" ? result.data.tv_results[0].id : result.data.movie_results[0].id
                }/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
              )
              .then(async (response) => {
                //console.log("trailer----", response.data);
                trailerUrl = youtubeUrl + response.data.results[0]?.key;
              })
              .catch((error) => console.log(error));

            if (req.query.type === "WEBSERIES") {
              var series = {
                title: result.data.tv_results[0].name,
                description: result.data.tv_results[0].overview,
                year: result.data.tv_results[0].first_air_date,
                image: imageUrl + result.data.tv_results[0].backdrop_path,
                thumbnail: imageUrl + result.data.tv_results[0].poster_path,
                media_type: result.data.tv_results[0].media_type,
                TmdbMovieId: result.data.tv_results[0].id,
                genre: result.data.tv_results[0].genre_ids,
                region: result.data.tv_results[0].origin_country,
                trailerUrl,
              };

              //genre for series
              const genreIds = await result.data.tv_results[0].genre_ids.map(async (id) => {
                const genere = await Genre.findOne({ uniqueId: id });
                return genere;
              });

              await Promise.all(genreIds).then(function (results) {
                series.genre = results;
              });

              //region for series
              const regionIds = await result.data.tv_results[0].origin_country.map(async (id) => {
                const region = await Region.findOne({ uniqueId: id });
                return region;
              });

              await Promise.all(regionIds).then(function (results) {
                series.region = results;
              });

              //console.log("series---", series);
            } else {
              var movie = {
                title: result.data.movie_results[0].title,
                description: result.data.movie_results[0].overview,
                year: result.data.movie_results[0].release_date,
                image: imageUrl + result.data.movie_results[0].backdrop_path,
                thumbnail: imageUrl + result.data.movie_results[0].poster_path,
                media_type: result.data.movie_results[0].media_type,
                TmdbMovieId: result.data.movie_results[0].id,
                genre: result.data.movie_results[0].genre_ids,
                //region: result.data.movie_results[0].origin_country,
                trailerUrl,
              };

              //genre for movie
              const genreIds = await result.data.movie_results[0].genre_ids.map(async (id) => {
                const genere = await Genre.findOne({ uniqueId: id });
                return genere;
              });

              await Promise.all(genreIds).then(function (results) {
                movie.genre = results;
              });

              //region for movie
              // const regionIds =
              //   await result.data.movie_results[0].origin_country.map(
              //     async (id) => {
              //       const region = await Region.findOne({ uniqueId: id });
              //       return region._id;
              //     }
              //   );

              // await Promise.all(regionIds).then(function (results) {
              //   movie.region = results;
              // });

              //console.log("movie---", movie);
            }
            return res.status(200).json({ status: true, message: "Success!!!", movie, series });
          }
        })
        .catch((error) => console.log(error));
    } else {
      return res.status(200).json({
        status: false,
        message: "title or IMDBid must be passed in query!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//create movie or webSeries from TMDB database
exports.getStore = async (req, res) => {
  try {
    if (!req.query.TmdbMovieId || !req.query.type) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details !",
      });
    }

    //movie or series detail API call
    await axios
      .get(
        //https://api.themoviedb.org/3/tv/89113?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
        `https://api.themoviedb.org/3/${req.query.type === "WEBSERIES" ? "tv" : "movie"}/${
          req.query.TmdbMovieId
        }?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
      )
      .then(async (result) => {
        //console.log("result--------------", result);

        if (req.query.type === "WEBSERIES") {
          const series = await new Movie();

          //genre for series
          const genereArray = await result.data.genres.map(async (data) => {
            const genereId = await Genre.findOne({ uniqueId: data.id });
            return genereId._id;
          });

          await Promise.all(genereArray).then(function (results) {
            series.genre = results;
          });

          //region for series
          const regionArray = await result.data.production_countries.map(async (data) => {
            const regionId = await Region.findOne({
              uniqueID: data.iso_3166_1,
            });
            return regionId._id;
          });

          await Promise.all(regionArray).then(function (results) {
            series.region = results;
          });

          //seasonData and episodeData
          await result.data.seasons.map(async (data) => {
            //seasonData
            const season = new Season();

            season.name = data.name;
            season.seasonNumber = data.season_number;
            season.episodeCount = data.episode_count;
            season.image = imageUrl + data.poster_path;
            season.releaseDate = data.air_date;
            season.TmdbSeasonId = data.id;
            season.movie = series._id;

            //console.log("seasonData-----", season);
            await season.save();

            //episodeData
            //https://api.themoviedb.org/3/tv/89113/season/1?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
            await axios
              .get(
                `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/season/
                 ${[data.season_number]}?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
              )
              .then(async (resultEpisode) => {
                //console.log("episode----", resultEpisode.data);

                await resultEpisode.data.episodes.map(async (data) => {
                  const episode = new Episode();

                  episode.name = data.name;
                  episode.episodeNumber = data.episode_number;
                  episode.image = imageUrl + data.still_path;
                  episode.seasonNumber = data.season_number;
                  episode.runtime = data.runtime;
                  episode.TmdbMovieId = data.show_id;
                  episode.movie = series._id;
                  episode.season = season._id;

                  await episode.save();

                  //console.log("episodeData-----", episode);
                });
              })
              .catch((error) => console.log(error));
          });

          //trailer for series API call
          await axios
            //https://api.themoviedb.org/3/tv/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
            .get(`https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`)
            .then(async (response) => {
              //console.log("trailer----", response.data);

              await response.data.results.map(async (data) => {
                const trailerData = new Trailer();
                trailerData.name = data.name;
                trailerData.size = data.size;
                trailerData.type = data.type;
                trailerData.videoUrl = youtubeUrl + data.key;
                trailerData.key = data.key;
                trailerData.trailerImage = imageUrl + result.data.backdrop_path;
                trailerData.movie = series._id;

                await trailerData.save();

                //console.log("trailerdata------", trailerData);
              });
            })
            .catch((error) => console.log(error));

          //credit(cast) for series API call
          await axios
            //https://api.themoviedb.org/3/tv/89113/aggregate_credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
            .get(
              `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/aggregate_credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
            )
            .then(async (creditRes) => {
              //console.log("credit----", creditRes);

              await creditRes.data.cast.map(async (data) => {
                const castData = new Role();

                castData.name = data.name;
                castData.image = imageUrl + data.profile_path;
                castData.position = data.known_for_department;
                castData.movie = series._id;

                await castData.save();

                //console.log("castData------", castData);
              });
            })
            .catch((error) => console.log(error));

          series.title = result.data.name;
          series.year = result.data.first_air_date;
          series.description = result.data.overview;
          series.image = imageUrl + result.data.backdrop_path;
          series.thumbnail = imageUrl + result.data.poster_path;
          series.TmdbMovieId = result.data.id;
          series.media_type = "tv";
          series.date = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });
          //console.log("series-----", series);

          await series.save();

          //New release (series) related notification.....
          const userId = await User.find({
            "notification.NewReleasesMovie": true,
          }).distinct("_id");

          await userId.map(async (id) => {
            const notification = new Notification();

            notification.title = series.title;
            notification.message = `Get Ready to Binge: New ${series.title} Added Today!`;
            notification.userId = id;
            notification.movieId = series._id;
            notification.image = series.image;
            notification.date = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            });
            await notification.save();
          });

          const userFCM = await User.find({
            "notification.NewReleasesMovie": true,
          }).distinct("fcmToken");

          console.log("fcmToken in series from TMDB: ", userFCM);

          const payload = {
            registration_ids: userFCM,
            notification: {
              title: `New Release`,
              body: "Get Ready: Latest WebSeries Watchlist is Here!",
            },
          };

          await fcm.send(payload, function (error, response) {
            if (error) {
              console.log("Something has gone wrong!!", error);
            } else {
              res.status(200);
              // .json({
              //   status: true,
              //   message: "Successfully sent message",
              // });

              console.log("Successfully sent with response: ", response);
            }
          });

          return res.status(200).json({
            status: true,
            message: "WebSeries data imported Successfully!",
            series,
          });
        } else if (req.query.type === "MOVIE") {
          const movie = await new Movie();

          movie.videoType = req.body.videoType;
          movie.link = req.body.link;

          //genre for movie
          const genereArray = await result.data.genres.map(async (data) => {
            const genereId = await Genre.findOne({ uniqueId: data.id });
            return genereId?._id;
          });

          await Promise.all(genereArray).then(function (results) {
            movie.genre = results;
          });

          //region for movie
          const regionArray = await result.data.production_countries.map(async (data) => {
            const regionId = await Region.findOne({
              uniqueID: data.iso_3166_1,
            });
            return regionId._id;
          });

          await Promise.all(regionArray).then(function (results) {
            movie.region = results;
          });

          //trailer for movie API call
          await axios
            //https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
            .get(
              `https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
            )
            .then(async (response) => {
              //console.log("trailer----", response.data);

              await response.data.results.map(async (data) => {
                const trailerData = new Trailer();
                trailerData.name = data.name;
                trailerData.size = data.size;
                trailerData.type = data.type;
                trailerData.videoUrl = youtubeUrl + data.key;
                trailerData.key = data.key;
                trailerData.trailerImage = imageUrl + result.data.backdrop_path;
                trailerData.movie = movie._id;

                await trailerData.save();
                //console.log("trailerdata------", trailerData);
              });
            })
            .catch((error) => console.log(error));

          //credit(cast) for movie API call
          await axios
            //https://api.themoviedb.org/3/movie/595/credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US
            .get(
              `https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
            )
            .then(async (creditRes) => {
              //console.log("credit----", creditRes);

              await creditRes.data.cast.map(async (data) => {
                const castData = new Role();

                castData.name = data.name;
                castData.image = imageUrl + data.profile_path;
                castData.position = data.known_for_department;
                castData.movie = movie._id;

                await castData.save();

                //console.log("castData------", castData);
              });
            })
            .catch((error) => console.log(error));

          //for media_type movie find by IMDBid API call
          const IMDBidMediaType = await result.data.imdb_id;

          await axios
            .get(
              `https://api.themoviedb.org/3/find/${IMDBidMediaType}?api_key=10471161c6c1b74f6278ff73bfe95982&language=en&external_source=imdb_id`
            )
            .then(async (result) => {
              //console.log(result.data);

              movie.media_type = result.data.movie_results[0].media_type;
            })
            .catch((error) => console.log(error));

          movie.title = result.data.title;
          movie.year = result.data.release_date;
          movie.runtime = result.data.runtime;
          movie.description = result.data.overview;
          movie.image = imageUrl + result.data.backdrop_path;
          movie.thumbnail = imageUrl + result.data.poster_path;
          movie.TmdbMovieId = result.data.id;
          movie.IMDBid = result.data.imdb_id;
          movie.date = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });

          await movie.save();
          //console.log("movie-----", movie);

          //New release (movie) related notification.....
          const userId = await User.find({
            "notification.NewReleasesMovie": true,
          }).distinct("_id");

          await userId.map(async (id) => {
            const notification = new Notification();

            notification.title = movie.title;
            notification.message = `${movie.title} is Here! Don't Miss It!`;
            notification.userId = id;
            notification.movieId = movie._id;
            notification.image = movie.image;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          });

          const userFCM = await User.find({
            "notification.NewReleasesMovie": true,
          }).distinct("fcmToken");

          console.log("fcmToken in movie from TMDB:  ", userFCM);

          const payload = {
            registration_ids: userFCM,
            notification: {
              title: `New Release`,
              body: "Stay Tuned: New Movie Alert!",
            },
          };

          await fcm.send(payload, function (error, response) {
            if (error) {
              console.log("Something has gone wrong!!", error);
            } else {
              res.status(200);
              // .json({
              //   status: true,
              //   message: "Successfully sent message",
              // });
              console.log("Successfully sent with response: ", response);
            }
          });

          return res.status(200).json({
            status: true,
            message: "Movie data imported Successfully!",
            movie,
          });
        }
      })
      .catch((error) => console.log(error));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//get year for movie or series
exports.getYear = async (req, res) => {
  try {
    const movie = await Movie.find({}).select("year");

    return res.status(200).json({ status: true, message: "Successful!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//update movie or weSeries
exports.update = async (req, res) => {
  try {
    console.log("body in update movie or webSeries:", req.body);

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was Found!!" });
    }

    movie.title = req.body.title ? req.body.title : movie.title;
    movie.year = req.body.year ? req.body.year : movie.year;
    movie.region = req.body.region ? req.body.region : movie.region;
    movie.type = req.body.type ? req.body.type : movie.type;
    movie.videoType = req.body.videoType ? req.body.videoType : movie.videoType;
    movie.runtime = req.body.runtime ? req.body.runtime : movie.runtime;
    movie.description = req.body.description ? req.body.description : movie.description;

    const multipleGenre = req.body.genre ? req.body.genre.toString().split(",") : movie.genre;
    movie.genre = multipleGenre;

    if (req.body.image) {
      const urlParts = movie.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.image = req.body.image ? req.body.image : movie.image;
    }

    if (req.body.thumbnail) {
      const urlParts = movie.thumbnail.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.thumbnail = req.body.thumbnail ? req.body.thumbnail : movie.thumbnail;
    }

    if (req.body.link) {
      const urlParts = movie.link.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.link = req.body.link ? req.body.link : movie.link;
    }

    await movie.save(async (error, movie) => {
      if (error) {
        console.log(error);
        return res.status(200).json({ status: false, message: "Server Error!!" });
      } else {
        const query = [
          { path: "region", select: "name" },
          { path: "genre", select: "name" },
        ];

        const data = await Movie.findById(movie._id).populate(query);

        return res.status(200).json({
          status: true,
          message: "Movie Updated Successfully!!",
          movie: data,
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

//add view to movie
exports.addView = async (req, res) => {
  try {
    if (!req.query.movieId) {
      return res.status(200).json({ status: false, message: "Movie Id is required!!" });
    }
    const movie = await Movie.findById(req.query.movieId);

    if (!movie) return res.status(200).json({ status: false, message: "No Movie Was Found!!" });

    movie.view += 1;
    await movie.save();

    return res.status(200).json({ status: true, message: "View Added successfully!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get all top10 through view for android
exports.getAllTop10 = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    var matchQuery;
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    console.log(matchQuery);

    const movie = await Movie.find(matchQuery)
      .sort({
        view: -1,
      })
      .limit(10);

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get most viewed movies or webSeries for admin panel
exports.getAllCategoryTop10 = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    var matchQuery;
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    const movie = await Movie.find(matchQuery)
      .populate(query)
      .sort({
        view: -1,
      })
      .limit(10);

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//isNewRelease
exports.isNewRelease = async (req, res) => {
  try {
    if (!req.query.movieId) {
      return res.status(200).json({ status: false, message: "Movie Id is required !" });
    }
    const movie = await Movie.findById(req.query.movieId);

    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was Found!!" });
    }

    movie.isNewRelease = !movie.isNewRelease;

    await movie.save(async (error, movie) => {
      if (error) {
        return res.status(200).json({ status: false, message: "Server Error!!" });
      } else {
        return res.status(200).json({ status: true, message: "Success!!", movie });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all isNewRelease
exports.getAllNewRelease = async (req, res) => {
  try {
    const movie = await Movie.find({ isNewRelease: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get movie(all category) wise trailer or episode for android
exports.MovieDetail = async (req, res) => {
  try {
    console.log("movieDetails: ", req.query);

    if (!req.query.movieId || !req.query.userId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(500).json({
        status: false,
        message: "No Movie or Web-Series Were Found!!",
      });
    }

    const user = await User.findById(req.query.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    const downloadExist = await Download.findOne({
      userId: user._id,
      movieId: movie._id,
    });

    // console.log("download..............", downloadExist);

    const favorite = await Favorite.findOne({
      $and: [
        {
          userId: user._id,
          movieId: movie._id,
        },
      ],
    });

    // console.log("favorite..............", favorite);

    const planExist = await User.findOne({ _id: user._id }, { isPremiumPlan: true });

    // console.log("plan..............", planExist);

    const ratingExist = await Rating.findOne({
      userId: user._id,
      movieId: movie._id,
    });

    // console.log("ratingExist..............", ratingExist);

    await Movie.aggregate([
      {
        $match: { _id: movie._id },
      },
      { $addFields: { isDownload: downloadExist ? true : false } },
      { $addFields: { isFavorite: favorite ? true : false } },
      { $addFields: { isPlan: planExist.isPremiumPlan ? true : false } },
      { $addFields: { isRating: ratingExist ? true : false } },
      {
        $lookup: {
          from: "episodes",
          let: {
            movieId: movie._id,
          },
          as: "episode",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$$movieId", "$movie"] }, { $eq: ["$seasonNumber", 1] }],
                },
              },
            },
            { $sort: { episodeNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: movie._id,
          },
          as: "trailer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "roles",
          let: {
            movieId: movie._id,
          },
          as: "role",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "seasons",
          let: {
            movieId: movie._id,
          },
          as: "season",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $sort: { seasonNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: {
            movie: movie._id,
          },
          as: "rating",

          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movie", "$movieId"] },
              },
            },
            {
              $group: {
                _id: "$movieId",
                totalUser: { $sum: 1 }, //totalRating by user
                avgRating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          thumbnail: 0,
          date: 0,
        },
      },
    ]).exec(async (error, data) => {
      if (error) console.log(error);
      else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: ["name"] },
          { path: "genre", select: ["name"] },
        ]);

        return res.status(200).json({ status: true, message: "Successful!!", movie: data_ });
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

//get movie(all category) wise trailer or episode for admin panel
exports.MovieDetails = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movie = await Movie.findById(req.query.movieId);

    if (!movie) {
      return res.status(500).json({ status: false, message: "No Movie Was Found!!" });
    }

    await Movie.aggregate([
      {
        $match: { _id: movie._id },
      },
      {
        $lookup: {
          from: "episodes",
          let: {
            movieId: movie._id,
          },
          as: "episode",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$$movieId", "$movie"] }, { $eq: ["$seasonNumber", 1] }],
                },
              },
            },
            { $sort: { episodeNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: movie._id,
          },
          as: "trailer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "roles",
          let: {
            movieId: movie._id,
          },
          as: "role",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: {
            movie: movie._id,
          },
          as: "rating",

          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movie", "$movieId"] },
              },
            },
            {
              $group: {
                _id: "$movieId",
                totalUser: { $sum: 1 }, //totalRating by user
                avgRating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          date: 0,
        },
      },
    ]).exec(async (error, data) => {
      if (error) console.log(error);
      else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: ["name"] },
          { path: "genre", select: ["name"] },
        ]);

        return res.status(200).json({ status: true, message: "Successful!!", movie: data_ });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//searching in Movie
exports.search = async (req, res) => {
  try {
    if (!req.body.search) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    if (req.body.search) {
      const response = await Movie.find({
        $or: [
          {
            title: { $regex: req.body.search, $options: "i" },
          },
        ],
      }).populate(query);

      return res.status(200).json({ status: true, message: "Success!!", movie: response });
    } else if (req.body.search === "") {
      return res.status(200).json({ status: true, message: "No data found!!", movie: [] });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all movie for admin panel
exports.getAll = async (req, res) => {
  try {
    if (!req.query.type || !req.query.start || !req.query.limit)
      return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    var matchQuery;
    if (req.query.type === "WEBSERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    const totalMoviesWebSeries = await Movie.countDocuments(matchQuery);

    const movie = await Movie.find(matchQuery)
      .populate(query)
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      totalMoviesWebSeries,
      movie,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete movie for admin panel
exports.destroy = async (req, res) => {
  try {
    const movie = await Movie.findById(mongoose.Types.ObjectId(req.query.movieId));
    if (!movie) {
      return res.status(200).json({ status: false, message: "No movie was found!!" });
    }

    if (movie.link) {
      //delete the old link from digitalOcean Spaces
      const urlParts = movie.link.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (movie.image) {
      //delete the old image from digitalOcean Spaces
      const urlParts = movie.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (movie.thumbnail) {
      //delete the old thumbnail from digitalOcean Spaces
      const urlParts = movie.thumbnail.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    //delete season
    const season = await Season.find({ movie: movie._id });

    if (season.length > 0) {
      await season.map(async (seasonData) => {
        await seasonData.deleteOne();
      });
    }

    //delete episode
    const episode = await Episode.find({ movie: movie._id });

    if (episode.length > 0) {
      await episode.map(async (episodeData) => {
        if (episodeData.videoUrl) {
          //delete the old episodeVideo from digitalOcean Spaces
          const urlParts = episodeData.videoUrl.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        if (episodeData.image) {
          //delete the old episodeImage from digitalOcean Spaces
          const urlParts = episodeData.image.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await episodeData.deleteOne();
      });
    }

    //delete trailer
    const trailer = await Trailer.find({ movie: movie._id });

    if (trailer.length > 0) {
      await trailer.map(async (trailerData) => {
        if (trailerData.videoUrl) {
          //delete the old trailerVideourl from digitalOcean Spaces
          const urlParts = trailerData.videoUrl.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        if (trailerData.trailerImage) {
          //delete the old trailerImage from digitalOcean Spaces
          const urlParts = trailerData.trailerImage.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await trailerData.deleteOne();
      });
    }

    //console.log(trailer.length);

    //delete role
    const role = await Role.find({ movie: movie._id });

    if (role.length > 0) {
      await role.map(async (roleData) => {
        if (roleData.image) {
          //delete the old image from digitalOcean Spaces
          const urlParts = roleData.image.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await roleData.deleteOne();
      });
    }

    //console.log(role.length);

    await movie.deleteOne();

    return res.status(200).json({
      status: true,
      message: "All Movie related data deleted Successfully!!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all more like this movie
exports.getAllLikeThis = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movieExist = await Movie.findById(req.query.movieId);
    if (!movieExist) {
      return res.status(200).json({ status: false, message: "Movie does not found!!" });
    }

    const movie = await Movie.find({
      _id: { $ne: movieExist._id },
      media_type: { $eq: movieExist.media_type },
      //category: movieExist.category,
    });

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all movie for android
exports.getMovie = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    const planExist = await User.findOne({ _id: user._id }, { isPremiumPlan: true });
    //console.log("planExist----", planExist);

    await Movie.aggregate([
      { $addFields: { isPlan: planExist.isPremiumPlan ? true : false } },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$movieId", "$movie"] },
                    {
                      $or: [{ $eq: ["$type", "Trailer"] }, { $eq: ["$type", "Teaser"] }],
                    },
                  ],
                },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
          as: "trailer",
        },
      },
      {
        $lookup: {
          from: "favorites",
          let: {
            movieId: "$_id",
            userId: user._id,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$movieId", "$$movieId"] }, { $eq: ["$userId", user._id] }],
                },
              },
            },
          ],
          as: "isFavorite",
        },
      },
      {
        $project: {
          year: 1,
          isNewRelease: 1,
          image: 1,
          title: 1,
          description: 1,
          region: 1,
          genre: 1,
          type: 1,
          thumbnail: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
          media_type: 1,
          isPlan: 1,
          isFavorite: {
            $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true],
          },
          trailer: 1,
        },
      },
    ]).exec(async (error, data) => {
      if (error) {
        console.log(error);
      } else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: "name" },
          { path: "genre", select: "name" },
        ]);

        return res.status(200).json({ status: true, message: "Success!!", movie: data_ });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: true,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all movie for android
//exports.getMovie = async (req, res) => {
//   try {
//     if (!req.query.userId)
//       return res
//         .status(200)
//         .json({ status: false, message: "Oops ! Invalid details!!" });

//     const favorite = await Favorite.find({
//       userId: req.query.userId,
//     }).distinct("movieId");

//     // console.log("movieId------------", favorite);

//     var query;
//     if (favorite.length > 0) {
//       // console.log("favorite------------", favorite);
//       query = {
//         $addFields: {
//           isFavorite: { $cond: [{ $in: ["$_id", favorite] }, true, false] },
//         },
//       };
//     } else {
//       query = { $addFields: { isFavorite: false } };
//     }

//     const movie = await Movie.aggregate([query]).sort({ createdAt: -1 });

//     return res
//       .status(200)
//       .json({ status: true, message: "Successful !", movie });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       error: error.message || "Internal Server error!",
//     });
//   }
//};

//get all movie or webSeries filterWise
exports.MovieFilterWise = async (req, res) => {
  console.log("data in MovieFilterWise: ", req.body);

  try {
    var regionArray = [];
    if (req?.body?.region) {
      console.log("called");

      const array = Array.isArray(req.body.region) ? req.body.region : [req.body.region];
      for (const region of array) {
        const elements = region.split(",");

        for (const element of elements) {
          regionArray.push(new mongoose.Types.ObjectId(element));
        }
      }
    }

    var genreArray = [];
    if (req?.body?.genre) {
      console.log("called");

      const array = Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre];
      for (const genre of array) {
        const elements = genre.split(",");

        for (const element of elements) {
          genreArray.push(new mongoose.Types.ObjectId(element));
        }
      }
    }

    var yearArray = [];
    if (req?.body?.year) {
      console.log("called");

      const array = Array.isArray(req.body.year) ? req.body.year : [req.body.year];
      for (const year of array) {
        const elements = year.split(",");

        for (const element of elements) {
          yearArray.push(element);
        }
      }
    }

    var typeArray = [];
    if (req?.body?.media_type) {
      console.log("called");

      const array = Array.isArray(req.body.media_type) ? req.body.media_type : [req.body.media_type];
      for (const media_type of array) {
        const elements = media_type.split(",");

        for (const element of elements) {
          typeArray.push(element);
        }
      }
    }

    // console.log("regionArray_ _____", regionArray);
    // console.log("genreArray_ _____", genreArray);
    // console.log("typeArray _____", typeArray);
    // console.log("yearArray _____", yearArray);

    const movie = await Movie.aggregate([
      {
        $match: {
          $or: [{ region: { $in: regionArray } }, { genre: { $in: genreArray } }, { year: { $in: yearArray } }],
          media_type: { $in: typeArray },
        },
      },
      {
        $project: {
          _id: 1,
          year: 1,
          isNewRelease: 1,
          image: 1,
          thumbnail: 1,
          title: 1,
          media_type: 1,
          region: 1,
          genre: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//best ComedyMovie for android (home)
exports.bestComedyMovie = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    var matchQuery;
    if (req.query.type === "COMEDY") {
      matchQuery = { genre: "63d213f74cc85c8fc4ca7fc4", media_type: "movie" };
    }

    const movie = await Movie.find(matchQuery).sort({ view: -1 });

    return res.status(200).json({ status: true, message: "finally, get best ComedyMovie!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get topRated movies or webseries for android
exports.getAllTopRated = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    let matchQuery = {};
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    console.log("----matchQuery", matchQuery);

    const movie = await Movie.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "movieId",
          as: "movieRating",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          //ratingAverage: { $avg: "$movieRating.rating" },
          ratingAverage: {
            $cond: {
              if: { $eq: [{ $avg: "$movieRating.rating" }, null] },
              then: { $avg: 0 },
              else: { $avg: "$movieRating.rating" },
            },
          },
          link: 1,
          image: 1,
          thumbnail: 1,
          title: 1,
          category: 1,
          type: 1,
          media_type: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
        },
      },
      { $sort: { ratingAverage: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({ status: true, message: "Success!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
