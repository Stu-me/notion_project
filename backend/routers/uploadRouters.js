const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadAudio } = require('../controllers/uploadController');

const router = express.Router();

router.post('/audio', authMiddleware, uploadAudio);

module.exports = router;
