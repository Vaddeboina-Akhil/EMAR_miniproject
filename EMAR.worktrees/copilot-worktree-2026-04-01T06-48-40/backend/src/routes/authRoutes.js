const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/patient/register', authController.registerPatient);
router.post('/patient/login', authController.loginPatient);
router.post('/doctor/register', authController.registerDoctor);
router.post('/doctor/login', authController.loginDoctor);
router.post('/staff/register', authController.registerStaff);
router.post('/staff/login', authController.loginStaff);

module.exports = router;