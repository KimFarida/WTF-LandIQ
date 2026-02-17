const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Create new assessment
router.post('/', assessmentController.createAssessment);

// List user's saved assessments
router.get('/', assessmentController.listAssessments);

// Get single assessment
router.get('/:id', assessmentController.getAssessment);

// Save a temporary assessment
router.patch('/:id/save', assessmentController.saveAssessment);

// Delete an assessment
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;