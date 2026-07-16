const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { requireActiveSubscription } = require('../middlewares/subscriptionMiddleware')

const {getWorkspaces,createWorkspaces,updateWorkspaces,deleteWorkspaces} = require('../controllers/workplaceController')

//remeber the authMiddleware check the token and gives 
// us user info in req.user

router.get('/',authMiddleware,requireActiveSubscription,getWorkspaces)
router.post('/',authMiddleware,requireActiveSubscription,createWorkspaces)
router.put('/:id',authMiddleware,requireActiveSubscription,updateWorkspaces)
router.delete('/:id',authMiddleware,requireActiveSubscription,deleteWorkspaces)

module.exports = router
