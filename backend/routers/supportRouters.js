const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createSupportQuery, getMySupportQueries } = require('../controllers/supportController');

const router = express.Router();

router.use(authMiddleware);
router.post('/queries', createSupportQuery);
router.get('/my-queries', getMySupportQueries);

module.exports = router;
