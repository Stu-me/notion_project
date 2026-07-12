const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')

const {getWorkspaces,createWorkspaces,updateWorkspaces,deleteWorkspaces} = require('../controllers/workplaceController')

//remeber the authMiddleware check the token and gives 
// us user info in req.user

router.get('/',authMiddleware,getWorkspaces)
router.post('/',authMiddleware,createWorkspaces)
router.put('/:id',authMiddleware,updateWorkspaces)
router.delete('/:id',authMiddleware,deleteWorkspaces)

module.exports = router