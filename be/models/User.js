const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    phone_number: { type: String, unique: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    userDescription: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }
    // Bỏ createdAt & updatedAt nếu dùng timestamps
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

// Mã hoá password nếu thay đổi
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// So sánh password
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
