const express = require('express');
const {getPage,createPage,getAllPages,updatePage,deletePage} = require('../controllers/pageController')
const authMiddleware = require('../middlewares/authMiddleware');
const { requireActiveSubscription } = require('../middlewares/subscriptionMiddleware');
const router = express.Router();

router.get('/',authMiddleware,requireActiveSubscription,getAllPages);
router.post('/',authMiddleware,requireActiveSubscription,createPage);
router.get('/:id',authMiddleware,requireActiveSubscription,getPage);
router.put('/:id',authMiddleware,requireActiveSubscription,updatePage)
router.delete('/:id',authMiddleware,requireActiveSubscription,deletePage);

module.exports = router
