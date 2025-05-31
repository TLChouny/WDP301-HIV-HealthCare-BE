const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ARVRregimenSchema = new Schema({
  arvName: { type: String, required: true },
  arvDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("ARVRregimen", ARVRregimenSchema);