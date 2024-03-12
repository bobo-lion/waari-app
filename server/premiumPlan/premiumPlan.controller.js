const PremiumPlan = require("./premiumPlan.model");

//import model
const User = require("../user/user.model");
const PremiumPlanHistory = require("./premiumPlanHistory.model");
const Setting = require("../setting/setting.model");

//google play
const Verifier = require("google-play-billing-validator");

//import config
const config = require("../../config");

//notification
const Notification = require("../notification/notification.model");

//FCM node
var FCM = require("fcm-node");
var fcm = new FCM(config.SERVER_KEY);

//create PremiumPlan
exports.store = async (req, res) => {
  try {
    if (!req.body.validity || !req.body.validityType || !req.body.dollar || !req.body.productKey || !req.body.planBenefit)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const premiumPlan = new PremiumPlan();

    premiumPlan.name = req.body.name;
    premiumPlan.validity = req.body.validity;
    premiumPlan.validityType = req.body.validityType;
    premiumPlan.dollar = req.body.dollar;
    premiumPlan.tag = req.body.tag;
    premiumPlan.productKey = req.body.productKey;
    premiumPlan.planBenefit = req.body.planBenefit.split(",");

    await premiumPlan.save();

    return res.status(200).json({ status: true, message: "Success!!", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update PremiumPlan
exports.update = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.findById(req.query.premiumPlanId);

    if (!premiumPlan) {
      return res.status(200).json({ status: false, message: "premiumPlan does not found!!" });
    }

    premiumPlan.name = req.body.name ? req.body.name : premiumPlan.name;
    premiumPlan.validity = req.body.validity ? req.body.validity : premiumPlan.validity;
    premiumPlan.validityType = req.body.validityType ? req.body.validityType : premiumPlan.validityType;
    premiumPlan.dollar = req.body.dollar ? req.body.dollar : premiumPlan.dollar;
    premiumPlan.tag = req.body.tag ? req.body.tag : premiumPlan.tag;
    premiumPlan.productKey = req.body.productKey ? req.body.productKey : premiumPlan.productKey;

    const planbenefit = req.body.planBenefit.toString();

    premiumPlan.planBenefit = planbenefit ? planbenefit.split(",") : premiumPlan.planBenefit;

    await premiumPlan.save();

    return res.status(200).json({ status: true, message: "Success!!", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete PremiumPlan
exports.destroy = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.findById(req.query.premiumPlanId);
    if (!premiumPlan) return res.status(200).json({ status: false, message: "premiumPlan does not found!!" });

    await premiumPlan.deleteOne();

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get PremiumPlan
exports.index = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.find().sort({
      validityType: 1,
      validity: 1,
    });

    if (!premiumPlan) return res.status(200).json({ status: false, message: "No data found!!" });

    return res.status(200).json({ status: true, message: "Success!!", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//create PremiumPlanHistory
exports.createHistory = async (req, res) => {
  try {
    if (req.body.userId && req.body.premiumPlanId && req.body.paymentGateway) {
      const user = await User.findById(req.body.userId);
      if (!user) {
        return res.json({
          status: false,
          message: "User does not found!!",
        });
      }

      const premiumPlan = await PremiumPlan.findById(req.body.premiumPlanId);
      if (!premiumPlan) {
        return res.json({
          status: false,
          message: "PremiumPlan does not found!!",
        });
      }

      user.isPremiumPlan = true;
      user.plan.planStartDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      user.plan.premiumPlanId = premiumPlan._id;

      await user.save();

      const history = new PremiumPlanHistory();

      history.userId = user._id;
      history.premiumPlanId = premiumPlan._id;
      history.paymentGateway = req.body.paymentGateway; // 1.GooglePlay 2.RazorPay 3.Stripe
      history.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      await history.save();

      const history_ = await PremiumPlanHistory.find({
        userId: req.body.userId,
      }).populate("userId premiumPlanId");

      history_.map(async (data) => {
        if (user.notification.Subscription === true) {
          const notification = new Notification();

          notification.title = "Plan Purchased";
          notification.message = `You have purchased through ${history.paymentGateway}.`;
          notification.userId = req.body.userId;
          notification.image = "https://work8.digicean.com/storage/PremiumNotification.png";
          notification.date = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });

          await notification.save();

          const payload = {
            to: data.userId.fcmToken,
            notification: {
              title: `Plan Purchased`,
              body: `You have purchased through ${history.paymentGateway}.`,
            },
          };

          console.log("data---------------", data.userId.fcmToken);

          await fcm.send(payload, function (error, response) {
            if (error) {
              console.log("Something has gone wrong!!", error);
            } else {
              res.status(200);
              // .json({
              //   status: true,
              //   message: "Successfully sent message!!",
              // });
              console.log("Successfully sent with response: ", response);
            }
          });
        }
      });

      return res.json({
        status: true,
        message: "Success!!",
        history,
      });
    } else {
      return res.json({
        status: false,
        message: "Oops!! Invalid details!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get premiumPlanHistory of particular user
exports.premiumPlanHistory = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.query.userId) {
      const user = await User.findById(req.query.userId);
      if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

      matchQuery = { userId: user._id };
    }

    if (!req.query.startDate || !req.query.endDate || !req.query.start || !req.query.limit)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let dateFilterQuery = {};

    let start_date = new Date(req.query.startDate);
    let end_date = new Date(req.query.endDate);

    if (req.query.startDate !== "ALL" && req.query.endDate !== "ALL") {
      dateFilterQuery = {
        analyticDate: {
          $gte: start_date,
          $lte: end_date,
        },
      };
    }

    console.log("dateFilterQuery---", dateFilterQuery);

    const history = await PremiumPlanHistory.aggregate([
      {
        $match: matchQuery,
      },
      {
        $addFields: {
          analyticDate: {
            $toDate: {
              $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
            },
          },
        },
      },
      {
        $match: dateFilterQuery,
      },
      {
        $sort: { analyticDate: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "premiumplans",
          localField: "premiumPlanId",
          foreignField: "_id",
          as: "premiumPlan",
        },
      },
      {
        $unwind: {
          path: "$premiumPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          paymentGateway: 1,
          premiumPlanId: 1,
          userId: 1,
          UserName: "$user.fullName",
          dollar: "$premiumPlan.dollar",
          validity: "$premiumPlan.validity",
          validityType: "$premiumPlan.validityType",
          purchaseDate: "$date",
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, // how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      total: history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      history: history[0].history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
