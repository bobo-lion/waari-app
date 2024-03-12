const Role = require("./role.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//import model
const Movie = require("../movie/movie.model");

//create role
exports.store = async (req, res) => {
  try {
    if (req.body && req.body.name && req.body.position && req.body.image && req.body.movieId) {
      const movie = await Movie.findById(req.body.movieId);
      if (!movie) return res.status(200).json({ status: false, message: "Movie does not found!" });

      const role = new Role();

      role.name = req.body.name;
      role.position = req.body.position;
      role.movie = movie._id;
      role.image = req.body.image;

      await role.save();

      const data = await Role.findById(role._id).populate([{ path: "movie", select: "title" }]);

      return res.status(200).json({
        status: true,
        message: "role Inserted Successfully!!",
        role: data,
      });
    } else {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update role
exports.update = async (req, res) => {
  try {
    const role = await Role.findById(req.query.roleId);
    if (!role) {
      return res.status(200).json({ status: false, message: "Role does not found!!" });
    }

    //delete the old image from digitalOcean Spaces
    if (role.image) {
      const urlParts = role.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("old image in role: ", role.image);

      await deleteFromSpace({ folderStructure, keyName });

      role.image = req.body.image ? req.body.image : role.image;

      console.log("new imagein role: ", role.image);
    }

    role.name = req.body.name ? req.body.name : role.name;
    role.position = req.body.position ? req.body.position : role.position;
    role.movie = req.body.movie ? req.body.movie : role.movie;

    await role.save();

    const data = await Role.findById(role._id).populate([{ path: "movie", select: "title" }]);

    return res.status(200).json({
      status: true,
      message: "role Updated Successfully!!",
      role: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//delete role
exports.destroy = async (req, res) => {
  try {
    const role = await Role.findById(req.query.roleId);
    if (!role) {
      return res.status(200).json({ status: false, message: "Role does not found!!" });
    }

    //delete the old image from digitalOcean Spaces
    if (role.image) {
      const urlParts = role.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element+

      await deleteFromSpace({ folderStructure, keyName });
    }

    await role.deleteOne();

    return res.status(200).json({ status: true, message: "role deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//get all role
exports.get = async (req, res) => {
  try {
    const query = [{ path: "movie", select: "title" }];

    const role = await Role.find().populate(query).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success!!", role });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//get role movieId wise for admin panel
exports.getIdWise = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(500).json({ status: false, message: "No Movie Was Found!!" });
    }

    const matchQuery = { movie: movie._id };
    const query = [{ path: "movie", select: "title" }];

    const role = await Role.find(matchQuery).populate(query).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success!!", role });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};
