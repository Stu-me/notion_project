const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { requireActiveSubscription } = require('../middlewares/subscriptionMiddleware')
const {getAllBlocks,createBlock,updateBlock,deleteBlock,reorderBlock} = require('../controllers/blockController')

router.get('/:pageId',authMiddleware,requireActiveSubscription,getAllBlocks);
router.post('/:pageId',authMiddleware,requireActiveSubscription,createBlock);
router.put('/:id',authMiddleware,requireActiveSubscription,updateBlock);
router.delete('/:id',authMiddleware,requireActiveSubscription,deleteBlock);
router.patch('/reorder/:pageId',authMiddleware,requireActiveSubscription,reorderBlock);

module.exports = router
