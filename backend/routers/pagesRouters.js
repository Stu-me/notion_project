const express = require('express');
const {getPage,createPage,getAllPages,updatePage,deletePage} = require('../controllers/pageController')
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/',authMiddleware,getAllPages);
router.post('/',authMiddleware,createPage);
router.get('/:id',authMiddleware,getPage);
router.put('/:id',authMiddleware,updatePage)
router.delete('/:id',authMiddleware,deletePage);

module.exports = router