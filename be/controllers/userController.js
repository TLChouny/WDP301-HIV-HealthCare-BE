const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/sendEmail');
const { sendSMS } = require('../utils/sendSMS');

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
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
      userName: userName || undefined, // Optional
      email,
      password,
      phone_number: phone_number || undefined, // Optional
      otp,
      otpExpires,
      isVerified: false,
    });

    await user.save();

    const subject = 'Verify Your Email - OTP Code';
    const text = `Your OTP code is ${otp}. It will expire in 10 minutes.`;
    await sendOTP(email, subject, text);

    res.status(201).json({ message: 'User registered. Please verify your email with the OTP sent.' });
  } catch (error) {
    console.log(error); // Log for debugging
    res.status(400).json({ message: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

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

    // Đánh dấu là đã xác minh và xóa OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // ✅ Tạo JWT token để trả về
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1m' }
    );

    // ✅ Trả về token
    res.status(200).json({ message: 'Verification successful', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    // OTP expired or not exist => tạo OTP mới
    const newOtp = generateOTP();
    const otpExpires = now + 10 * 60 * 1000; // 10 phút

    user.otp = newOtp;
    user.otpExpires = otpExpires;
    await user.save();

    const subject = 'Resend Verify Your Email - OTP Code';
    const text = `Your new OTP code is ${newOtp}. It will expire in 10 minutes.`;
    await sendOTP(email, subject, text);

    return res.status(200).json({ message: 'New OTP has been sent to your email.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;
    let user;
    if (phone_number) {
      user = await User.findOne({ phone_number });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email or phone number before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};