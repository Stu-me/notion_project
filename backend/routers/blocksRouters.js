const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { resolveAccountTier, enforceFreeResourceLimit, enforceBlockTypeAccess } = require('../middlewares/subscriptionMiddleware')
const {getAllBlocks,createBlock,updateBlock,deleteBlock,reorderBlock} = require('../controllers/blockController')

router.get('/:pageId',authMiddleware,resolveAccountTier,getAllBlocks);
router.post('/:pageId',authMiddleware,resolveAccountTier,enforceFreeResourceLimit('block'),enforceBlockTypeAccess,createBlock);
router.put('/:id',authMiddleware,resolveAccountTier,enforceBlockTypeAccess,updateBlock);
router.delete('/:id',authMiddleware,resolveAccountTier,deleteBlock);
router.patch('/reorder/:pageId',authMiddleware,resolveAccountTier,reorderBlock);

module.exports = router
