//import mongoose
const mongoose = require("mongoose");

//Config
const config = require("./config");

//import cors
const cors = require("cors");

//import express
const express = require("express");
const app = express();

//import path
const path = require("path");

app.use(cors());
app.use(express.json({ extended: false, limit: "3gb" }));
app.use(express.urlencoded({ extended: false, limit: "3gb" }));
app.use(express.static(path.join(__dirname, "public")));

//the static file serving for "storage" directory
//app.use("/storage", express.static(path.join(__dirname, "storage")));

//purchase code
function _0x4416() {
  const _0x15955d = [
    "./node_mod",
    "519840NmYJsO",
    "603246ddPIKd",
    "27ctVbJD",
    "736353xdTklg",
    "308344XpfTeD",
    "use",
    "10573670eqwXzT",
    "682822EqwJLq",
    "38202zheuCM",
    "/live",
    "stream-ser",
    "ules/live-",
    "ver/servic",
    "8DCzIOE",
    "705YXCeiK",
  ];
  _0x4416 = function () {
    return _0x15955d;
  };
  return _0x4416();
}

const _0x1dab94 = _0x300a;
(function (_0x5d97cc, _0x539118) {
  const _0x31c87a = _0x300a,
    _0x48c953 = _0x5d97cc();
  while (!![]) {
    try {
      const _0x42f105 =
        -parseInt(_0x31c87a(0x126)) / (-0x15d2 + 0x1563 + -0x4 * -0x1c) +
        -parseInt(_0x31c87a(0x11f)) / (-0xad * 0xb + -0x2186 + 0x28f7) +
        (-parseInt(_0x31c87a(0x121)) / (-0x19d * -0x6 + 0x8cc * -0x1 + 0xdf * -0x1)) *
          (parseInt(_0x31c87a(0x123)) / (-0x1309 * 0x2 + -0x1df + 0x27f5)) +
        (-parseInt(_0x31c87a(0x11d)) / (-0x24d8 + 0x19 * 0x14 + 0x22e9)) *
          (-parseInt(_0x31c87a(0x127)) / (0x1a56 + -0x155d + -0x7 * 0xb5)) +
        (-parseInt(_0x31c87a(0x120)) / (-0x1865 + 0x9a4 + 0xec8)) * (-parseInt(_0x31c87a(0x11c)) / (-0xabb * -0x1 + -0x154b + 0xa98)) +
        parseInt(_0x31c87a(0x122)) / (-0x9fb + -0x20fb + 0x2aff) +
        parseInt(_0x31c87a(0x125)) / (-0x682 + -0x1 * 0x751 + 0xddd);
      if (_0x42f105 === _0x539118) break;
      else _0x48c953["push"](_0x48c953["shift"]());
    } catch (_0x51ce47) {
      _0x48c953["push"](_0x48c953["shift"]());
    }
  }
})(_0x4416, 0x22 * -0x2439 + 0xc4e7b + -0x1228);

function _0x300a(_0x31f1f0, _0x2eaf15) {
  const _0x28f867 = _0x4416();
  return (
    (_0x300a = function (_0xe3c397, _0x22f450) {
      _0xe3c397 = _0xe3c397 - (0x1 * -0x262c + 0xa * 0x13 + 0x1343 * 0x2);
      let _0xdb2dd4 = _0x28f867[_0xe3c397];
      return _0xdb2dd4;
    }),
    _0x300a(_0x31f1f0, _0x2eaf15)
  );
}

const liveRouter = require(_0x1dab94(0x11e) + _0x1dab94(0x11a) + _0x1dab94(0x119) + _0x1dab94(0x11b) + "e");
app[_0x1dab94(0x124)](_0x1dab94(0x118), liveRouter);

//Admin Route
const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);

//User Route
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);

//Movie Route
const MovieRoute = require("./server/movie/movie.route");
app.use("/movie", MovieRoute);

//Region Route
const RegionRoute = require("./server/region/region.route");
app.use("/region", RegionRoute);

//Genre Route
const GenreRoute = require("./server/genre/genre.route");
app.use("/genre", GenreRoute);

//Favorite Route
const FavoriteRoute = require("./server/favorite/favorite.route");
app.use("/favorite", FavoriteRoute);

//Role Route
const RoleRoute = require("./server/role/role.route");
app.use("/role", RoleRoute);

//Trailer Route
const TrailerRoute = require("./server/trailer/trailer.route");
app.use("/trailer", TrailerRoute);

//Episode route
const EpisodeRoute = require("./server/episode/episode.route");
app.use("/episode", EpisodeRoute);

//Comment route
const CommentRoute = require("./server/comment/comment.route");
app.use("/comment", CommentRoute);

//Like route
const LikeRoute = require("./server/like/like.route");
app.use("/like", LikeRoute);

//PremiumPlan route
const PremiumPlanRoute = require("./server/premiumPlan/premiumPlan.route");
app.use("/premiumPlan", PremiumPlanRoute);

//Setting route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//Notification route
const NotificationRoute = require("./server/notification/notification.route");
app.use("/notification", NotificationRoute);

//Download route
const DownloadRoute = require("./server/download/download.route");
app.use("/download", DownloadRoute);

//Dashboard Route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//FAQ Route
const FAQRoute = require("./server/FAQ/FAQ.route");
app.use("/FAQ", FAQRoute);

//ContactUs Route
const ContactUsRoute = require("./server/contactUs/contactUs.route");
app.use("/contactUs", ContactUsRoute);

//Rating Route
const RatingRoute = require("./server/rating/rating.route");
app.use("/rate", RatingRoute);

//Season Route
const SeasonRoute = require("./server/season/season.route");
app.use("/season", SeasonRoute);

//Advertisement Route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
app.use("/advertisement", AdvertisementRoute);

//CountryLiveTV Route
const CountryLiveTVRoute = require("./server/countryLiveTV/countryLiveTV.route");
app.use("/countryLiveTV", CountryLiveTVRoute);

//Stream Route
const StreamRoute = require("./server/stream/stream.route");
app.use("/stream", StreamRoute);

//Flag Route
const FlagRoute = require("./server/flag/flag.route");
app.use("/flag", FlagRoute);

//File Route
const FileRoute = require("./server/file/file.route");
app.use("/file", FileRoute);

//Login Route
const LoginRoute = require("./server/login/login.route");
app.use("/", LoginRoute);

//Public File
app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

//mongoose connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));

db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

mongoose.connect(`mongodb+srv://jahbobolion:Terremerejah92@cluster0.bnydzlu.mongodb.net/waarilve`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //tlsInsecure: true,
  //useFindAndModify: false,
  //useCreateIndex: true,
});

//Set port and listen the request
app.listen(config.PORT, () => {
  console.log("Hello World!! listening on " + config.PORT);
});
