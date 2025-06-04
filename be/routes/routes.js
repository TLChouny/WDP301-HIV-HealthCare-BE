const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const blogController = require('../controllers/blogController');
const userController = require('../controllers/userController');
const serviceController = require('../controllers/serviceController');
const arvrregimenController = require('../controllers/arvrregimenController');
const bookingController = require('../controllers/bookingController');
const resultController = require('../controllers/resultController');
const notificationController = require('../controllers/notificationController');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Category Routes
router.route('/categories')
  .post(auth, categoryController.create)
  .get(categoryController.getAll);

router.route('/categories/:id')
  .get(categoryController.getById)
  .put(auth, categoryController.updateById)
  .delete(auth, categoryController.deleteById);

// Blog Routes
router.route('/blogs')
  .post(auth, blogController.create)
  .get(blogController.getAll);

router.route('/blogs/:id')
  .get(blogController.getById)
  .put(auth, blogController.updateById)
  .delete(auth, blogController.deleteById);

// User Routes
router.route('/users')
  .post(userController.create) // Public registration
  .get(auth, userController.getAll);

router.route('/users/:id')
  .get(auth, userController.getById)
  .put(auth, userController.updateById)
  .delete(auth, userController.deleteById);

router.route('/users/login')
  .post(userController.login); // Public login

router.route('/users/verify-otp')
  .post(userController.verifyOTP);
   // Public OTP verification
router.route('/users/resend-otp')
  .post(userController.resendOTP);

// Service Routes
router.route('/services')
  .post(auth, serviceController.create)
  .get(serviceController.getAll);

router.route('/services/:id')
  .get(serviceController.getById)
  .put(auth, serviceController.updateById)
  .delete(auth, serviceController.deleteById);

router.route('/services/category/:categoryId')
  .get(serviceController.getByCategoryId); // Get services by category
    
// ARVRregimen Routes
router.route('/arvrregimens')
  .post(auth, arvrregimenController.create)
  .get(arvrregimenController.getAll);

router.route('/arvrregimens/:id')
  .get(arvrregimenController.getById)
  .put(auth, arvrregimenController.updateById)
  .delete(auth, arvrregimenController.deleteById);

// Booking Routes
router.route('/bookings')
  .post(auth, bookingController.create)
  .get(bookingController.getAll);

router.route('/bookings/:id')
  .get(bookingController.getById)
  .put(auth, bookingController.updateById)
  .delete(auth, bookingController.deleteById);

// Result Routes
router.route('/results')
  .post(auth, resultController.create)
  .get(resultController.getAll);

router.route('/results/:id')
  .get(resultController.getById)
  .put(auth, resultController.updateById)
  .delete(auth, resultController.deleteById);

// Notification Routes
router.route('/notifications')
  .post(auth, notificationController.create)
  .get(notificationController.getAll);

router.route('/notifications/:id')
  .get(notificationController.getById)
  .put(auth, notificationController.updateById)
  .delete(auth, notificationController.deleteById);

// Review Routes
router.route('/reviews')
  .post(auth, reviewController.create)
  .get(reviewController.getAll);

router.route('/reviews/:id')
  .get(reviewController.getById)
  .put(auth, reviewController.updateById)
  .delete(auth, reviewController.deleteById);

module.exports = router;