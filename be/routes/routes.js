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
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookCotroller');

const upload = require('../middleware/upload');
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
  .get(userController.getAll);

router.route('/users/:id')
  .get(auth, userController.getById)
  .put(auth, userController.updateById)
  .delete(auth, userController.deleteById);

router.put(
  '/users/:id/avatar',
  upload.single('avatar'),
  userController.updateAvatar
);

router.route('/users/login')
  .post(userController.login); // Public login
router.route('/users/logout')
  .post(userController.logout); // Protected logout

router.route('/users/forgot-password')
  .post(userController.forgotPassword); // Public forgot password

router.route('/users/reset-password')
  .post(userController.resetPassword); // Public reset password

router.route('/users/verify-reset-otp')
  .post(userController.verifyResetOTP); // Public token verification 

router.route('/users/verify-otp')
  .post(userController.verifyOTP); // Public OTP verification

router.route('/users/resend-otp')
  .post(userController.resendOTP); // Public OTP resend

// CRUD Work Schedule for doctor
router.get('/users/:id/work-schedule', userController.getWorkSchedule);

router.put('/users/:id/work-schedule', auth, userController.updateWorkSchedule);

router.delete('/users/:id/work-schedule', auth, userController.clearWorkSchedule);

//CRUD Certification for doctor
router.post('/:id/certifications', auth, userController.addCertification);
router.put('/:id/certifications/:certId', auth, userController.updateCertification);
router.delete('/:id/certifications/:certId', auth, userController.deleteCertification);
router.put('/:id/certifications/:certId/approve', auth, userController.approveCertification);
router.delete('/:id/certifications/:certId/reject', auth, userController.rejectCertification);
router.post('/:id/experiences', auth, userController.addExperience);
router.put('/:id/experiences/:expId', auth, userController.updateExperience);
router.delete('/:id/experiences/:expId', auth, userController.deleteExperience);
router.put('/:id/experiences/:expId/approve', auth, userController.approveExperience);
router.delete('/:id/experiences/:expId/reject', auth, userController.rejectExperience);

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
// Thêm route mới để kiểm tra khung giờ đã được đặt
router.route('/bookings/check')
  .get(bookingController.checkExistingBookings);

router.route('/bookings')
  .post(auth, bookingController.create)
  .get(bookingController.getAll);

router.route('/bookings/:id')
  .get(bookingController.getById)
  .put(auth, bookingController.updateById)
  .patch(auth, bookingController.updateById)
  .delete(auth, bookingController.deleteById);

router.route('/bookings/doctor/:doctorName')
  .get(bookingController.getBookingsByDoctorName); // Get bookings by UserID

// Order Routes
router.post("/create-payment-link", paymentController.createPaymentLink);
router.get("/order/:orderId", paymentController.getPaymentByOrderCode);
router.put("/order/:orderCode", paymentController.updatePaymentStatus);
router.get("/all", paymentController.getAllPayments);

// Webhook Routes
router.post("/receive-hook", webhookController.handlePaymentWebhook);
router.get("/receive-hook-get", webhookController.handleWebhook);


router.route('/bookings/user/:userId')
  .get(auth, bookingController.getBookingsByUserId); // Get bookings by UserID

// Result Routes
router.route('/results')
  .post(auth, resultController.create)
  .get(resultController.getAll);
router.route('/results/user/:userId')
  .get(auth, resultController.getAllByUserId); // Get results by UserID

router.route('/results/doctor/:doctorName')
  .get(auth, resultController.getAllByDoctorName); // Get results by DoctorName

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
router.route('/notifications/user/:userId')
  .get(notificationController.getByUserId); // Get notifications by UserID

// Review Routes
router.route('/reviews')
  .post(auth, reviewController.create)
  .get(reviewController.getAll);

router.route('/reviews/:id')
  .get(reviewController.getById)
  .put(auth, reviewController.updateById)
  .delete(auth, reviewController.deleteById);

module.exports = router;