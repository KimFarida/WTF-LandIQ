const { LandAssessment, SoilMappingUnit, SoilHealthScore } = require('../models');
const geoLookupService = require('../services/geoLookupService');
const aiService = require('../services/aiService')

/**
 * POST /api/assessments
 * Create a new land assessment from coordinates
 */
const createAssessment = async (req, res) => {
  try {
    const { latitude, longitude, area_hectares } = req.body;
    const user_id = req.user.id;

    if (!latitude || !longitude || !area_hectares) {
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, area_hectares',
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90.' });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180.' });
    }

    if (area_hectares <= 0) {
      return res.status(400).json({ error: 'area_hectares must be greater than 0.' });
    }

     // Step 1: Geo lookup — exact match or nearest neighbour
    const lookupResult = geoLookupService.lookup(latitude, longitude);

     // Step 2: If completely outside Nigeria and no nearest found, use AI general advice
    if (!lookupResult) {
      const { explanation, source } = aiService.generateGeneralExplanation(
        latitude, longitude, 'the specified location'
      )
      return res.status(200).json({
        assessment_id: null,
        coverage: 'none',
        message: 'No soil dataset coverage for this location. General advice provided.',
        ai_explanation: explanation,
        source,
        is_estimated: true,
      });
    }

    const { mapping_unit, is_estimated,  distance_km, outside_bounds } = lookupResult;

    //  Step 3: Get soil mapping unit record from DB
    const soilUnit = await SoilMappingUnit.findOne({
      where: { mapping_unit },
    });

    if (!soilUnit) {
      return res.status(500).json({
        error: 'Data integrity error',
        message: 'Mapping unit found in GeoJSON but not in database. Please contact support.',
      });
    }

    // Step 4: Create the land assessment record (temporary by default)
    const assessment = await LandAssessment.create({
      user_id,
      unit_id: soilUnit.unit_id,
      latitude,
      longitude,
      area_hectares,
      is_saved: false,
      is_temporary: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    // Step 5: Create the soil health score record
    const score = await SoilHealthScore.create({
      assessment_id: assessment.assessment_id,
      unit_id: soilUnit.unit_id,
      badge: soilUnit.badge,
      total_score: soilUnit.total_score,
      degradation_risk: soilUnit.degradation_risk,
      ai_explanation_status: 'pending', // AI call happens next
    });

    // Step 6: TODO - Call HuggingFace AI service here
    // Fire and forget — client can poll GET /api/assessments/:id for the explanation
    aiService.generateExplanation(soilUnit, score, is_estimated).catch(err => {
      console.error('Background AI generation failed:', err.message);
    });

    // Step 7: Return the full result
    return res.status(201).json({
      assessment_id: assessment.assessment_id,
      coverage: is_estimated ? 'estimated' : 'exact',
      ...(is_estimated && {
        estimated_note: `No exact match found. Using nearest soil unit ${distance_km}km away.`,
        distance_km,
      }),
      ...(outside_bounds && {
        outside_bounds_note: 'These coordinates are outside Nigeria. Assessment is estimated from nearest known soil unit.',
      }),
      location: {
        latitude: assessment.latitude,
        longitude: assessment.longitude,
        area_hectares: assessment.area_hectares,
      },
      soil_health: {
        badge: score.badge,
        total_score: score.total_score,
        degradation_risk: score.degradation_risk,
      },
      soil_properties: {
        suitability: soilUnit.suitability,
        drainage: soilUnit.drainage,
        ph_range: soilUnit.ph_range,
        ph_description: soilUnit.ph_description,
        slope: soilUnit.slope,
        soil_texture: soilUnit.soil_texture,
        soil_depth: soilUnit.soil_depth,
        ecological_zone: soilUnit.ecological_zone,
        major_crops: soilUnit.major_crops,
      },
      ai_explanation: null, // Generating in background — poll GET /:id
      ai_explanation_status: 'pending',
      is_temporary: assessment.is_temporary,
      expires_at: assessment.expires_at,
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * GET /api/assessments
 * List all saved assessments for the authenticated user
 */
const listAssessments = async (req, res) => {
  try {
    const user_id = req.user.id;

    const assessments = await LandAssessment.findAll({
      where: {
        user_id,
        is_saved: true,
      },
      include: [
        {
          model: SoilHealthScore,
          required: true,
        },
        {
          model: SoilMappingUnit,
          required: true,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      count: assessments.length,
      assessments: assessments.map(a => ({
        assessment_id: a.assessment_id,
        latitude: a.latitude,
        longitude: a.longitude,
        area_hectares: a.area_hectares,
        mapping_unit: a.SoilMappingUnit.mapping_unit,
        badge: a.SoilHealthScore.badge,
        total_score: a.SoilHealthScore.total_score,
        degradation_risk: a.SoilHealthScore.degradation_risk,
        created_at: a.created_at,
      })),
    });
  } catch (error) {
    console.error('Error listing assessments:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * GET /api/assessments/:id
 * Get a single assessment with full details
 */
const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const assessment = await LandAssessment.findOne({
      where: {
        assessment_id: id,
        user_id,
      },
      include: [
        {
          model: SoilHealthScore,
          required: true,
        },
        {
          model: SoilMappingUnit,
          required: true,
        },
      ],
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    return res.json({
      assessment_id: assessment.assessment_id,
      location: {
        latitude: assessment.latitude,
        longitude: assessment.longitude,
        area_hectares: assessment.area_hectares,
      },
      mapping_unit: assessment.SoilMappingUnit.mapping_unit,
      soil_health: {
        badge: assessment.SoilHealthScore.badge,
        total_score: assessment.SoilHealthScore.total_score,
        degradation_risk: assessment.SoilHealthScore.degradation_risk,
      },
      soil_properties: {
        suitability: assessment.SoilMappingUnit.suitability,
        drainage: assessment.SoilMappingUnit.drainage,
        ph_range: assessment.SoilMappingUnit.ph_range,
        slope: assessment.SoilMappingUnit.slope,
        soil_texture: assessment.SoilMappingUnit.soil_texture,
        soil_depth: assessment.SoilMappingUnit.soil_depth,
        ecological_zone: assessment.SoilMappingUnit.ecological_zone,
        major_crops: assessment.SoilMappingUnit.major_crops,
        risk_factors: assessment.SoilMappingUnit.risk_factors,
      },
      ai_explanation: assessment.SoilHealthScore.ai_plain_explanation,
      user_notes: assessment.user_notes,
      is_saved: assessment.is_saved,
      is_temporary: assessment.is_temporary,
      expires_at: assessment.expires_at,
      created_at: assessment.created_at,
    });
  } catch (error) {
    console.error('Error getting assessment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * PATCH /api/assessments/:id/save
 * Save a temporary assessment permanently
 */
const saveAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const assessment = await LandAssessment.findOne({
      where: {
        assessment_id: id,
        user_id,
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Promote to permanent
    assessment.is_saved = true;
    assessment.is_temporary = false;
    assessment.expires_at = null;
    await assessment.save();

    return res.json({
      message: 'Assessment saved successfully',
      assessment_id: assessment.assessment_id,
      is_saved: assessment.is_saved,
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * DELETE /api/assessments/:id
 * Delete an assessment
 */
const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const assessment = await LandAssessment.findOne({
      where: {
        assessment_id: id,
        user_id,
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    await assessment.destroy();

    return res.json({
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = { createAssessment, listAssessments, saveAssessment, getAssessment, deleteAssessment}