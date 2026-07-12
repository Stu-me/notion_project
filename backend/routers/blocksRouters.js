const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const {getAllBlocks,createBlock,updateBlock,deleteBlock,reorderBlock} = require('../controllers/blockController')

router.get('/:pageId',authMiddleware,getAllBlocks);
router.post('/:pageId',authMiddleware,createBlock);
router.put('/:id',authMiddleware,updateBlock);
router.delete('/:id',authMiddleware,deleteBlock);
router.patch('/reorder/:pageId',authMiddleware,reorderBlock);

module.exports = router