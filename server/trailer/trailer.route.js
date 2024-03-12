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
const trailerController = require("./trailer.controller");

//store trailer
route.post(
  "/create",
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "trailerImage", maxCount: 1 },
  ]),
  checkAccessWithSecretKey(),
  trailerController.store
);

//update trailer
route.patch(
  "/update",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "trailerImage", maxCount: 1 },
  ]),
  trailerController.update
);

//delete trailer
route.delete("/delete", checkAccessWithSecretKey(), trailerController.destroy);

//get trailer
route.get("/", checkAccessWithSecretKey(), trailerController.get);

//get trailer movieId wise for admin panel
route.get("/movieIdWise", checkAccessWithSecretKey(), trailerController.getIdWise);

module.exports = route;
