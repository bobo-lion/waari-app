const User = require("./user.model");
const moment = require("moment");

//import model
const premiumPlan = require("../premiumPlan/premiumPlan.model");
const Download = require("../download/download.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//user login and sign up
exports.store = async (req, res) => {
  try {
    if (!req.body.identity || req.body.loginType === undefined || !req.body.fcmToken)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    let userQuery;

    if (req.body.loginType == 0 || req.body.loginType == 1) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "Email is required!!" });
      }

      // userQuery = await User.findOne({ email: req.body.email });
      if (req.body.identity) {
        userQuery = await User.findOne({
          $and: [{ identity: req.body.identity }, { email: req.body.email }],
        });
      }
    } else if (req.body.loginType == 2) {
      if (!req.body.identity) {
        return res.status(200).json({ status: false, message: "Identity is required!!" });
      }

      userQuery = await User.findOne({ identity: req.body.identity });
    }
    // else if (req.body.loginType == 3) {
    //   if (!req.body.email && !req.body.password) {
    //     return res.status(200).json({
    //       status: false,
    //       message: "Email and Password both are required !",
    //     });
    //   }

    //   const emailExist = await User.findOne({ uniqueId: req.body.email });
    //   if (!emailExist) {
    //     return res.status(200).json({ status: false, message: "Id is Wrong!" });
    //   } else {
    //     if (emailExist.password !== req.body.password) {
    //       return res
    //         .status(200)
    //         .json({ status: false, message: "Password is Wrong!" });
    //     } else {
    //       const user_ = await userFunction(emailExist, req);

    //       return res.status(200).json({
    //         status: true,
    //         message: "Login Success!!",
    //         user: user_,
    //       });
    //     }
    //   }
    // }

    const user = userQuery;

    if (user) {
      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin!!" });
      }

      const user_ = await userFunction(user, req);

      const downloaduserId = await Download.find({
        userId: user._id,
      }).distinct("_id");

      console.log("downloaduserId-----", downloaduserId);

      if (downloaduserId) {
        await Download.deleteMany({})
          .then(function () {
            console.log("Data deleted"); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
      }

      return res.status(200).json({
        status: true,
        message: "finally, user login Successfully!!",
        user: user_,
        signup: false,
      });
    } else {
      console.log("---------signup----------");

      const newUser = new User();

      const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++) {
        referralCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      newUser.referralCode = referralCode;
      newUser.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      const user = await userFunction(newUser, req);

      return res.status(200).json({
        status: true,
        message: "finally, user Signup Successfully!",
        user,
        signup: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

const userFunction = async (user, data_) => {
  const data = data_.body;

  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  user.image = data.image ? data.image : user.image;
  user.fullName = data.fullName ? data.fullName : user.fullName;
  user.nickName = data.nickName ? data.nickName : user.nickName;
  user.email = data.email ? data.email.trim() : user.email;
  user.gender = data.gender ? data.gender.toLowerCase().trim() : user.gender;
  user.country = data.country ? data.country.trim() : user.country;
  user.loginType = data.loginType ? data.loginType : user.loginType;
  user.identity = data.identity;
  user.fcmToken = data.fcmToken;
  user.referralCode = data.referralCode ? data.referralCode : user.referralCode;
  user.uniqueId = !user.uniqueId ? await Promise.resolve(generateUserName()) : user.uniqueId;
  user.password = !user.password ? password : user.password;

  await user.save();
  return user;
};

//generate new unique username
const generateUserName = async () => {
  const random = () => {
    return Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
  };

  var uniqueId = random();

  let user = await User.findOne({ uniqueId: uniqueId });
  while (user) {
    uniqueId = random();
    user = await User.findOne({ uniqueId: uniqueId });
  }

  return uniqueId;
};

//get user profile who login
//exports.getProfile = async (req, res) => {
//   try {
//     if (!req.query.userId)
//       return res
//         .status(200)
//         .json({ status: false, message: "Oops ! Invalid details!!" });

//     const userExist = await User.findById(req.query.userId);
//     if (!userExist)
//       return res
//         .status(200)
//         .json({ status: false, message: "User does not found !" });

//     const user = await User.aggregate([{ $match: { _id: userExist._id } }]);

//     return res
//       .status(200)
//       .json({ status: true, message: "Success!!", user: user[0] });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ status: false, error: error.message || "Server Error" });
//   }
//};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    if (user.plan.premiumPlanId !== null && user.plan.planStartDate !== null) {
      const user_ = await checkPlan(user._id);

      return res.status(200).json({ status: true, message: "Success!!", user: user_ });
    }

    const user_ = await checkPlan(user._id);
    return res.status(200).json({ status: true, message: "Success!!", user: user_ });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//update profile of user
exports.updateProfile = async (req, res) => {
  try {
    if (!req.body.userId) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(200).json({ status: false, message: "user does not found!" });

    if (req?.body?.image) {
      //delete the old image from digitalOcean Spaces
      const urlParts = user.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      user.image = req.body.image ? req.body.image : user.image;
    }

    user.fullName = req.body.fullName ? req.body.fullName : user.fullName;
    user.nickName = req.body.nickName ? req.body.nickName : user.nickName;
    user.email = req.body.email ? req.body.email : user.email;
    user.gender = req.body.gender ? req.body.gender.toLowerCase().trim() : user.gender;
    user.country = req.body.country ? req.body.country : user.country;
    user.interest = req.body.interest ? req.body.interest.split(",") : user.interest;

    await user.save();

    return res.status(200).json({ status: true, message: "finally, update profile of the user!!", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//create dummy user
exports.index = async (req, res) => {
  try {
    if (!req.body || !req.body.fullName || !req.body.nickName || !req.body.gender || !req.body.image)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const user = new User();

    user.fullName = req.body.fullName;
    user.nickName = req.body.nickName;
    user.gender = req.body.gender;
    user.image = req.body.image;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "finally, dummy User Created Successfully!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

//get all user for admin
exports.get = async (req, res) => {
  try {
    const user = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success!!", user });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//check user plan is expired or not
const checkPlan = async (userId, res) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.plan.planStartDate !== null && user.plan.premiumPlanId !== null) {
      const plan = await premiumPlan.findById(user.plan.premiumPlanId);
      if (!plan) {
        return res.status(200).json({ status: false, message: "Plan does not found!!" });
      }

      if (plan.validityType.toLowerCase() === "day") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "day");
        if (diffTime > plan.validity) {
          user.isPremiumPlan = false;
          user.plan.planStartDate = null;
          user.plan.premiumPlanId = null;
        }
      }

      if (plan.validityType.toLowerCase() === "month") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "month");
        if (diffTime >= plan.validity) {
          user.isPremiumPlan = false;
          user.plan.planStartDate = null;
          user.plan.premiumPlanId = null;
        }
      }

      if (plan.validityType.toLowerCase() === "year") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "year");
        if (diffTime >= plan.validity) {
          user.isPremiumPlan = false;
          user.plan.planStartDate = null;
          user.plan.premiumPlanId = null;
        }
      }
    }

    await user.save();

    const user_ = await User.findById(userId);
    return user_;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!!",
    });
  }
};

//get countryWise user for admin
//exports.countryWiseUser = async (req, res) => {
//   try {
//     if (!req.query.country)
//       return res
//         .status(200)
//         .json({ status: true, message: "Oops ! Invalid details!!" });

//     const user_ = await User.aggregate([
//       {
//         $match: {
//           $and: [
//             {
//               country: req.query.country,
//             },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $group: {
//           _id: "$country",
//           totalUser: { $sum: 1 },
//         },
//       },
//     ]);

//     return res
//       .status(200)
//       .json({ status: true, message: "Success!!", user_ });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: error.message || "Internal Server Error!!",
//     });
//   }
//};

exports.countryWiseUser = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $group: {
          _id: "$country",
          totalUser: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success!!", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//user block or unbolck by admin
exports.blockUnblock = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, massage: "UserId is requried!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
