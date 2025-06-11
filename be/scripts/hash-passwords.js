const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/hiv-healthcare');

async function hashExistingPasswords() {
  try {
    const user = await User.findOne({ email: 'chauphan2107@gmail.com' });
    if (!user) {
      console.log('No user found with email: chauphan2107@gmail.com');
      return;
    }
    if (!user.password || !user.password.startsWith('$2b$')) {
      user.password = await bcrypt.hash(user.password || '', 10);
      await user.save();
      console.log(`Hashed password for ${user.email}`);
    } else {
      console.log(`Password for ${user.email} is already hashed`);
    }
  } catch (error) {
    console.error('Error hashing password:', error);
  } finally {
    mongoose.connection.close();
  }
}

hashExistingPasswords();