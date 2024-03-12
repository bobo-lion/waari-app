//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//controller
const AdminController = require("./admin.controller");

//create admin
route.post("/create", upload.single("image"), AdminController.store);

//admin login
route.post("/login", AdminController.login);

//update purchase code
route.patch("/updateCode", AdminController.updateCode);

//get admin profile
route.get("/profile", AdminMiddleware, AdminController.getProfile);

//update admin profile email and name
route.patch("/", AdminMiddleware, AdminController.update);

//update admin Profile Image
route.patch("/updateImage", AdminMiddleware, upload.single("image"), AdminController.updateImage);

//update admin password
route.put("/updatePassword", AdminMiddleware, AdminController.updatePassword);

//forgrt admin password (send email for forgot the password)
route.post("/forgetPassword", AdminController.forgotPassword);

//set admin password
route.post("/setPassword", AdminController.setPassword);

module.exports = route;
