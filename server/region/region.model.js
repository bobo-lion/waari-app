const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema(
  {
    name: { type: String },
    uniqueID: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Region", RegionSchema);
