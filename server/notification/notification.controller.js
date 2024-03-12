const Notification = require("./notification.model");

//import model
const User = require("../user/user.model");

//FCM node
var FCM = require("fcm-node");
var config = require("../../config");
var fcm = new FCM(config.SERVER_KEY);

//handle user notification true/false
exports.handleNotification = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!", user: {} });

    if (req.body.type === "GeneralNotification") {
      user.notification.GeneralNotification = !user.notification.GeneralNotification;
    }
    if (req.body.type === "NewReleasesMovie") {
      user.notification.NewReleasesMovie = !user.notification.NewReleasesMovie;
    }
    if (req.body.type === "AppUpdate") {
      user.notification.AppUpdate = !user.notification.AppUpdate;
    }
    if (req.body.type === "Subscription") {
      user.notification.Subscription = !user.notification.Subscription;
    }

    await user.save();

    return res.status(200).json({ status: true, message: "Success!!", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get notification list
exports.getNotificationList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    const notification = await Notification.find({ userId: user._id }).select("title message image date userId").sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "finally, get the notification list by the user!",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//send Notification for admin through topic
exports.sendNotification = async (req, res) => {
  try {
    const topic = "/topics/MOVA";

    var message = {
      to: topic,

      notification: {
        body: req.body.description,
        title: req.body.title,
        image: req.body.image,
      },
    };

    const notification = new Notification();

    notification.title = req.body.title;
    notification.description = req.body.description;
    //notification.image = config.baseURL + req.file.path;
    notification.image = req.body.image;
    notification.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await notification.save();

    await fcm.send(message, async (error, response) => {
      if (error) {
        console.log("Something has gone wrong: ", error);
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};

//send Notification by admin
exports.sendNotifications = async (req, res) => {
  try {
    if (req.body.notificationType.trim() === "General Notification") {
      const userId = await User.find({
        "notification.GeneralNotification": true,
      }).distinct("_id");

      await userId.map(async (data) => {
        const notification = new Notification();

        notification.userId = data._id;
        notification.title = req.body.title;
        notification.message = req.body.description;
        //notification.image = req.file ? config.baseURL + req.file.path : "";
        notification.image = req.body.image;
        notification.date = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
        await notification.save();
      });

      const userFCM = await User.find({
        "notification.GeneralNotification": true,
      }).distinct("fcmToken");

      console.log("fcmToken in General Notification type: ", userFCM);

      const payload = {
        registration_ids: userFCM,
        notification: {
          body: req.body.description,
          title: req.body.title,
          //image: req.file ? config.baseURL + req.file.path : "",
          image: req.body.image,
        },
      };

      await fcm.send(payload, async (error, response) => {
        if (error) {
          console.log("Something has gone wrong: ", error);
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });

      return res.status(200).json({ status: true, message: "Success!!" });
    } else if (req.body.notificationType.trim() === "App Update") {
      const userId = await User.find({
        "notification.AppUpdate": true,
      }).distinct("_id");

      await userId.map(async (data) => {
        const notification = new Notification();

        notification.userId = data._id;
        notification.title = req.body.title;
        notification.message = req.body.description;
        //notification.image = req.file ? config.baseURL + req.file.path : "";
        notification.image = req.body.image;
        notification.date = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
        await notification.save();
      });

      const userFCM = await User.find({
        "notification.AppUpdate": true,
      }).distinct("fcmToken");

      console.log("fcmToken in App Update type: ", userFCM);

      const payload = {
        registration_ids: userFCM,
        notification: {
          body: req.body.description,
          title: req.body.title,
          //image: req.file ? config.baseURL + req.file.path : "",
          image: req.body.image,
        },
      };

      await fcm.send(payload, async (error, response) => {
        if (error) {
          console.log("Something has gone wrong: ", error);
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });

      return res.status(200).json({ status: true, message: "Success!!" });
    } else {
      return res.status(200).json({ status: false, message: "please pass the valid notificationType!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
