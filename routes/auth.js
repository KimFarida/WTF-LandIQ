const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { registerRules } = require('../middleware/authValidator');

router.get('/', (req, res)=>{
    res.send("Welcome to Auth Route")
})

router.post('/register',registerRules, authController.registerUser)

module.exports = router;