const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/sendEmail');
const { sendSMS } = require('../utils/sendSMS');
const bcrypt = require('bcryptjs');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

exports.create = async (req, res) => {
  try {
    const { userName, email, password, phone_number } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required for registration' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (phone_number) {
      const existingPhone = await User.findOne({ phone_number });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 1 * 60 * 1000; // 1 phút
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Original password:", password, "Hashed password:", hashedPassword);

    const user = new User({
      userName: userName || undefined,
      email,
      password: hashedPassword,
      phone_number: phone_number || undefined,
      otp,
      otpExpires,
      isVerified: false,
    });

    await user.save();
    console.log("User saved with email:", email, "password hash:", user.password);

    const subject = 'Verify Your Email - OTP Code';
    const text = `Your OTP code is ${otp}. It will expire in 1 minute.`;
    await sendOTP(email, subject, text);
    res.status(201).json({ message: 'User registered. Please verify your email with the OTP sent.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    console.log("User verified:", user.email, "isVerified:", user.isVerified);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Verification successful', token });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const now = Date.now();
    if (user.otp && user.otpExpires > now) {
      return res.status(400).json({ message: 'Current OTP is still valid. Please check your email.' });
    }

    const newOtp = generateOTP();
    const otpExpires = now + 1 * 60 * 1000;

    user.otp = newOtp;
    user.otpExpires = otpExpires;
    await user.save();

    const subject = 'Resend Verify Your Email - OTP Code';
    const text = `Your new OTP code is ${newOtp}. It will expire in 1 minute.`;
    await sendOTP(email, subject, text);

    return res.status(200).json({ message: 'New OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP resend' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;
    console.log("Login Request Body:", req.body);

    if (!email && !phone_number) {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    let user;
    if (phone_number) {
      user = await User.findOne({ phone_number });
      console.log(`Searched by phone: ${phone_number}, found: ${!!user}`);
    } else {
      user = await User.findOne({ email });
      console.log(`Searched by email: ${email}, found: ${!!user}`);
    }

    if (!user) {
      console.log(`No user found for ${email || phone_number}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email || user.phone_number, "isVerified:", user.isVerified);
    if (!user.isVerified) {
      console.log("User not verified:", user.email || user.phone_number);
      return res.status(403).json({ message: "Please verify your email or phone number" });
    }

    console.log("Stored password hash:", user.password);
    const isMatch = await user.comparePassword(password);
    console.log("Password match result for user:", user.email || user.phone_number, "is:", isMatch);
    if (!isMatch) {
      console.log("Invalid password for:", user.email || user.phone_number);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role, userName: user.userName }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.accessToken = token;
    user.tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await user.save();
    console.log("Login successful, token generated:", token);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accessToken = undefined;
    user.tokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetOtp = generateOTP();
    const resetOtpExpires = Date.now() + 1 * 60 * 1000;
    user.resetOtp = resetOtp;
    user.resetOtpExpires = resetOtpExpires;
    await user.save();
    const subject = 'Reset Your Password - OTP Code';
    const text = `Your OTP code to reset your password is ${resetOtp}. It will expire in 1 minute.`;
    await sendOTP(email, subject, text);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'OTP verified successfully', resetToken });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword; // Sẽ được băm lại trong pre('save')
    user.accessToken = undefined;
    user.tokenExpiresAt = undefined;
    await user.save();
    console.log("Password after save in reset:", user.password);

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    user.accessToken = newToken;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully', token: newToken });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -resetOtp -accessToken');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -resetOtp -accessToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

exports.updateById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password -otp -resetOtp -accessToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ message: 'Server error during user update' });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
};

// Lấy lịch làm việc của doctor
exports.getWorkSchedule = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('role dayOfWeek startTimeInDay endTimeInDay startDay endDay');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'doctor') return res.status(403).json({ message: 'User is not a doctor' });

    res.status(200).json({
      dayOfWeek: user.dayOfWeek,
      startTimeInDay: user.startTimeInDay,
      endTimeInDay: user.endTimeInDay,
      startDay: user.startDay,
      endDay: user.endDay,
    });
  } catch (error) {
    console.error('Get work schedule error:', error);
    res.status(500).json({ message: 'Server error while fetching work schedule' });
  }
};

// Update lịch làm việc của doctor
exports.updateWorkSchedule = async (req, res) => {
  try {
    const { dayOfWeek, startTimeInDay, endTimeInDay, startDay, endDay } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'doctor') return res.status(403).json({ message: 'User is not a doctor' });

    user.dayOfWeek = dayOfWeek || user.dayOfWeek;
    user.startTimeInDay = startTimeInDay || user.startTimeInDay;
    user.endTimeInDay = endTimeInDay || user.endTimeInDay;
    user.startDay = startDay || user.startDay;
    user.endDay = endDay || user.endDay;

    await user.save();

    res.status(200).json({ message: 'Work schedule updated successfully', schedule: {
      dayOfWeek: user.dayOfWeek,
      startTimeInDay: user.startTimeInDay,
      endTimeInDay: user.endTimeInDay,
      startDay: user.startDay,
      endDay: user.endDay,
    }});
  } catch (error) {
    console.error('Update work schedule error:', error);
    res.status(500).json({ message: 'Server error while updating work schedule' });
  }
};

// Xoá lịch làm việc của doctor
exports.clearWorkSchedule = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'doctor') return res.status(403).json({ message: 'User is not a doctor' });

    user.dayOfWeek = [];
    user.startTimeInDay = undefined;
    user.endTimeInDay = undefined;
    user.startDay = undefined;
    user.endDay = undefined;

    await user.save();

    res.status(200).json({ message: 'Work schedule cleared successfully' });
  } catch (error) {
    console.error('Clear work schedule error:', error);
    res.status(500).json({ message: 'Server error while clearing work schedule' });
  }
};
