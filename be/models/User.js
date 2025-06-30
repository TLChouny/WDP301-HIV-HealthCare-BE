const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Category = require("./Category");

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
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    otp: { type: String },
    otpExpires: { type: Date },
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    accessToken: { type: String, default: undefined },
    tokenExpiresAt: { type: Date, default: undefined },

    // ======================
    // Lịch làm việc
    dayOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTimeInDay: { type: String }, // ex: "08:00"
    endTimeInDay: { type: String },   // ex: "17:00"
    startDay: { type: Date },
    endDay: { type: Date },
    // ======================

  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

// Middleware để băm mật khẩu nếu chưa băm
UserSchema.pre('save', async function (next) {
  console.log("Pre-save triggered for user:", this.email, "password before:", this.password);
  if (this.isModified('password') && !this.password.startsWith('$2')) { // Chỉ băm nếu chưa băm
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Password hashed in pre-save for user:", this.email, "original:", this.password, "hashed:", this.password);
  } else {
    console.log("Password not re-hashed in pre-save for user:", this.email, "value:", this.password);
  }
  next();
});

// Hàm so sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("Comparing candidate:", candidatePassword, "with stored hash:", this.password);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log("Comparison result for user:", this.email, "is:", isMatch);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
