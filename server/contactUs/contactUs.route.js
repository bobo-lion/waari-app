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
const contactController = require("./contactUs.controller");

//create contactUs
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), contactController.store);

//update contactUs
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), contactController.update);

//delete contactUs
route.delete("/delete", checkAccessWithSecretKey(), contactController.destroy);

//get contactUs
route.get("/", checkAccessWithSecretKey(), contactController.get);

module.exports = route;
