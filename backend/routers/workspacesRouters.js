const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { resolveAccountTier, enforceFreeResourceLimit } = require('../middlewares/subscriptionMiddleware')

const {getWorkspaces,createWorkspaces,updateWorkspaces,deleteWorkspaces} = require('../controllers/workplaceController')

//remeber the authMiddleware check the token and gives 
// us user info in req.user

router.get('/',authMiddleware,resolveAccountTier,getWorkspaces)
router.post('/',authMiddleware,resolveAccountTier,enforceFreeResourceLimit('workspace'),createWorkspaces)
router.put('/:id',authMiddleware,resolveAccountTier,updateWorkspaces)
router.delete('/:id',authMiddleware,resolveAccountTier,deleteWorkspaces)

module.exports = router
