const { LandAssessment, SoilMappingUnit, SoilHealthScore } = require('../models');
const geoLookupService = require('../services/geoLookupService');

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

    // Check if coordinates within dataset bound (pre-check)
    if (!geoLookupService.isWithinBounds(latitude, longitude)) {
      return res.status(404).json({
        error: 'Location outside coverage area',
        message: 'This location is not covered by our soil dataset. Currently covering Nigeria.',
      });
    }

    // Find which mapping unit contains coordinates
    const mapping_unit = geoLookupService.findMappingUnit(latitude, longitude);

    if (!mapping_unit) {
      return res.status(404).json({
        error: 'No soil data available for this location',
        message: 'These coordinates do not match any known soil mapping unit in our dataset.',
      });
    }

    // Get the full soil mapping unit record from DB
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

    // Create the soil health score record
    // Copy the scoring fields from the mapping unit
    const score = await SoilHealthScore.create({
      assessment_id: assessment.assessment_id,
      unit_id: soilUnit.unit_id,
      badge: soilUnit.badge,
      total_score: soilUnit.total_score,
      degradation_risk: soilUnit.degradation_risk,
      ai_explanation_status: 'pending', // AI call happens next
    });

    // Step 6: TODO - Call HuggingFace AI service here
    // For now, we'll skip this and just return the score

    // Step 7: Return the full result
    return res.status(201).json({
      assessment_id: assessment.assessment_id,
      location: {
        latitude: assessment.latitude,
        longitude: assessment.longitude,
        area_hectares: assessment.area_hectares,
      },
      mapping_unit: soilUnit.mapping_unit,
      soil_health: {
        badge: score.badge,
        total_score: score.total_score,
        degradation_risk: score.degradation_risk,
      },
      soil_properties: {
        suitability: soilUnit.suitability,
        drainage: soilUnit.drainage,
        ph_range: soilUnit.ph_range,
        slope: soilUnit.slope,
        soil_texture: soilUnit.soil_texture,
        soil_depth: soilUnit.soil_depth,
        ecological_zone: soilUnit.ecological_zone,
        major_crops: soilUnit.major_crops,
        risk_factors: soilUnit.risk_factors,
      },
      ai_explanation: score.ai_plain_explanation, // null for now until AI integration
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


module.exports = { createAssessment}