const express = require('express');
const router = express.Router()
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);



module.exports = router;