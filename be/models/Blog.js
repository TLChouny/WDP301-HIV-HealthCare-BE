const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BlogSchema = new mongoose.Schema(
  {
  blogTitle: { type: String, required: true },
  blogContent: { type: String },
  blogAuthor: { type: String },
  blogImage: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
