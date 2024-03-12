const mongoose = require("mongoose");

const PremiumPlanHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    premiumPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "PremiumPlan" },
    paymentGateway: { type: String },
    date: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("PremiumPlanHistory", PremiumPlanHistorySchema);
