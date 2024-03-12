//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//controller
const UserController = require("./user.controller");

//user login and sign up
route.post("/login", checkAccessWithSecretKey(), UserController.store);

//get user profile who login
route.get("/profile", checkAccessWithSecretKey(), UserController.getProfile);

//get all user for admin panel
route.get("/", checkAccessWithSecretKey(), UserController.get);

//update profile of user
route.patch("/update", upload.single("image"), checkAccessWithSecretKey(), UserController.updateProfile);

//create dummy user
route.post("/dummy", upload.single("image"), UserController.index);

//get countryWise user
route.get("/countryWiseUser", checkAccessWithSecretKey(), UserController.countryWiseUser);

//user block or unbolck
route.patch("/blockUnblock", checkAccessWithSecretKey(), UserController.blockUnblock);

module.exports = route;
