const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { registerRules, loginRules } = require('../middleware/authValidator');
const { authenticateToken } = require('../middleware/auth');

router.get('/', (req, res)=>{
    res.send("Welcome to Auth Route")
})

router.post('/register',registerRules, authController.registerUser)
router.post('/login', loginRules, authController.loginUser)
router.post('/logout', authenticateToken, authController.logOutUser)

module.exports = router;