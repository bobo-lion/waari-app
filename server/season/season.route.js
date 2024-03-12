//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const SeasonController = require("./season.controller");

//get season
route.get("/", checkAccessWithSecretKey(), SeasonController.get);

//get season particular movieId wise
route.get("/movieIdWise", checkAccessWithSecretKey(), SeasonController.getIdWise);

//create season for manual
route.post("/create", upload.single("image"), checkAccessWithSecretKey(), SeasonController.store);

//update season
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), SeasonController.update);

//delete season
route.delete("/delete", checkAccessWithSecretKey(), SeasonController.destroy);

module.exports = route;
