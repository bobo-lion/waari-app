//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const GenreController = require("./genre.controller");

//create genre
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), GenreController.store);

//create genre from TMDB database
//route.post("/getStore", checkAccessWithSecretKey(), GenreController.getStore);

//update genre
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), GenreController.update);

//delete genre
route.delete("/delete", checkAccessWithSecretKey(), GenreController.destroy);

//get genre
route.get("/", checkAccessWithSecretKey(), GenreController.get);

module.exports = route;
