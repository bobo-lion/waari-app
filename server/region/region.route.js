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
const RegionController = require("./region.controller");

//create region
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), RegionController.store);

//create region from TMDB database
//route.post("/getStore", checkAccessWithSecretKey(), RegionController.getStore);

//update region
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), RegionController.update);

//get region
route.get("/", checkAccessWithSecretKey(), RegionController.get);

//delete region
route.delete("/delete", checkAccessWithSecretKey(), RegionController.destroy);

module.exports = route;
