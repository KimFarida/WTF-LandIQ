const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Create new assessment

/**
 * @swagger
 * /api/assessments:
 *   post:
 *     tags: [Assessments]
 *     summary: Create land assessment
 *     description: |
 *       Submit coordinates to get a soil health assessment. The system will:
 *       1. Find the matching soil mapping unit via geospatial lookup
 *       2. Generate a Gold/Silver/Bronze rating
 *       3. Create an AI-powered explanation (generated in background)
 *       
 *       Coverage scenarios:
 *       - **exact**: Coordinates fall inside a known polygon
 *       - **estimated**: No exact match - using nearest soil unit
 *       - **none**: Outside Nigeria - general agricultural advice provided
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - area_hectares
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 12.9848
 *                 description: Latitude coordinate (Nigeria is roughly 4°N to 14°N)
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 4.5579
 *                 description: Longitude coordinate (Nigeria is roughly 3°E to 15°E)
 *               area_hectares:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 example: 10.0
 *                 description: Size of land parcel in hectares
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assessment'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Location outside coverage area
 */
router.post('/', assessmentController.createAssessment);

// List user's saved assessments
/**
 * @swagger
 * /api/assessments:
 *   get:
 *     tags: [Assessments]
 *     summary: List saved assessments
 *     description: Get all saved (non-temporary) assessments for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assessments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 assessments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assessment_id:
 *                         type: string
 *                         format: uuid
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       area_hectares:
 *                         type: number
 *                       mapping_unit:
 *                         type: string
 *                       badge:
 *                         type: string
 *                         enum: [GOLD, SILVER, BRONZE]
 *                       total_score:
 *                         type: integer
 *                       degradation_risk:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', assessmentController.listAssessments);

// Get single assessment
/**
 * @swagger
 * /api/assessments/{id}:
 *   get:
 *     tags: [Assessments]
 *     summary: Get single assessment
 *     description: Retrieve detailed information for a specific assessment including AI explanation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assessment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/:id', assessmentController.getAssessment);

// Save a temporary assessment
/**
 * @swagger
 * /api/assessments/{id}/save:
 *   patch:
 *     tags: [Assessments]
 *     summary: Save assessment permanently
 *     description: |
 *       Convert a temporary assessment (24hr expiry) to a saved assessment.
 *       Saved assessments never expire and appear in the user's saved list.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assessment saved successfully
 *                 assessment_id:
 *                   type: string
 *                   format: uuid
 *                 is_saved:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.patch('/:id/save', assessmentController.saveAssessment);

// Delete an assessment
/**
 * @swagger
 * /api/assessments/{id}:
 *   delete:
 *     tags: [Assessments]
 *     summary: Delete assessment
 *     description: Permanently delete an assessment and its associated score
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assessment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;