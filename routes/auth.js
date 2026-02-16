const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { registerRules, loginRules } = require('../middleware/authValidator');

router.get('/', (req, res)=>{
    res.send("Welcome to Auth Route")
})

router.post('/register',registerRules, authController.registerUser)
router.post('/login', loginRules, authController.loginUser)

module.exports = router;