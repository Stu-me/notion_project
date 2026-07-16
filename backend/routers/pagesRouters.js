const express = require('express');
const {getPage,createPage,getAllPages,updatePage,deletePage} = require('../controllers/pageController')
const authMiddleware = require('../middlewares/authMiddleware');
const { resolveAccountTier, enforceFreeResourceLimit } = require('../middlewares/subscriptionMiddleware');
const router = express.Router();

router.get('/',authMiddleware,resolveAccountTier,getAllPages);
router.post('/',authMiddleware,resolveAccountTier,enforceFreeResourceLimit('page'),createPage);
router.get('/:id',authMiddleware,resolveAccountTier,getPage);
router.put('/:id',authMiddleware,resolveAccountTier,updatePage)
router.delete('/:id',authMiddleware,resolveAccountTier,deletePage);

module.exports = router
