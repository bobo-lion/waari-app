const Setting = require("./setting.model");

//create Setting
exports.store = async (req, res) => {
  try {
    const setting = new Setting();

    setting.googlePlayKey = req.body.googlePlayKey;

    await setting.save();

    return res.status(200).json({ status: true, message: "Success!!", setting });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update Setting
exports.update = async (req, res) => {
  try {
    if (!req.query.settingId) return res.status(200).json({ status: false, message: "SettingId is requried!!" });

    const setting = await Setting.findById(req.query.settingId);

    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found!!" });
    }

    setting.googlePlayEmail = req.body.googlePlayEmail ? req.body.googlePlayEmail : setting.googlePlayEmail;
    setting.googlePlayKey = req.body.googlePlayKey ? req.body.googlePlayKey : setting.googlePlayKey;
    setting.stripePublishableKey = req.body.stripePublishableKey ? req.body.stripePublishableKey : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ? req.body.stripeSecretKey : setting.stripeSecretKey;
    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.privacyPolicyText = req.body.privacyPolicyText ? req.body.privacyPolicyText : setting.privacyPolicyText;
    setting.currency = req.body.currency ? req.body.currency : setting.currency;
    setting.razorPayId = req.body.razorPayId ? req.body.razorPayId : setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey ? req.body.razorSecretKey : setting.razorSecretKey;

    await setting.save((error, setting) => {
      if (error) {
        return res.status(200).json({ status: false, message: "Server Error!!" });
      } else {
        return res.status(200).json({
          status: true,
          message: "Setting Updated Successfully!!",
          setting,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    const setting = await Setting.findById(req.query.settingId);
    if (!setting) return res.status(200).json({ status: false, message: "Setting does not found!!" });

    if (req.query.type === "googlePlay") {
      setting.googlePlaySwitch = !setting.googlePlaySwitch;
    } else if (req.query.type === "stripe") {
      setting.stripeSwitch = !setting.stripeSwitch;
    } else if (req.query.type === "razorPay") {
      setting.razorPaySwitch = !setting.razorPaySwitch;
    } else if (req.query.type === "IptvAPI") {
      setting.isIptvAPI = !setting.isIptvAPI;
    } else {
      setting.isAppActive = !setting.isAppActive;
    }

    await setting.save();

    return res.status(200).json({ status: true, message: "Success!!", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get setting data
exports.index = async (req, res) => {
  try {
    const setting = await Setting.find().sort({ createdAt: -1 });

    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting data does not found!!" });
    }

    return res.status(200).json({ status: true, message: "Success!!", setting: setting[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
