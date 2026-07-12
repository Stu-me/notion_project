const express = require('express');
const authMiddleware  = require('../middlewares/authMiddleware')

const router = express.Router();
const {registerUser,loginUser,userInfo,forgotPassword,resetPassword} = require('../controllers/authController')
//api/auth
router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/me',authMiddleware,userInfo); // we have to use jwt token wherever authmiddleware is used
router.post('/forgotpassword',forgotPassword);
router.put('/resetpassword/:token',resetPassword);
module.exports = router;