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
    role: { type: String, enum: ['user', 'admin', 'doctor', 'staff'], default: 'user' },
    avatar: { type: String },
    userDescription: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    otp: { type: String },
    otpExpires: { type: Date },
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    accessToken: { type: String, default: undefined },
    tokenExpiresAt: { type: Date, default: undefined },
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
    console.log("Password hashed in pre-save for user:", this.email, "original:", this.password, "hashed:", this.password);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("Comparing candidate:", candidatePassword, "with stored hash:", this.password);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log("Comparison result for user:", this.email, "is:", isMatch);
  return isMatch;
};
module.exports = mongoose.model("User", UserSchema);
