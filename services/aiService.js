const { SoilHealthScore, AiExplanationLog } = require('../models')

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = process.env.HF_API_URL;
const MODEL_NAME = process.env.MODEL_NAME;


// promt builder - Builds a structured prompt from soil data
/**
 * Handles dataset-matched and nearest-neighbour estimated results
 *
 * @param {object} soilUnit - SoilMappingUnit record
 * @param {object} score    - SoilHealthScore record
 * @param {boolean} isEstimated - true if nearest neighbour fallback was used
 * @returns {string} prompt
 */
function buildPrompt(soilUnit, score, isEstimated = false){
    const badgeLabel = {
        GOLD : 'Excellent (Gold)',
        SILVER: 'Moderate (Silver)',
        BRONZE: 'Poor (Bronze)'
    }[score.badge] || score.badge

    const riskLabel = {
        LOW: 'Low risk of degradation',
        MEDIUM: 'Moderate risk of degradation',
        HIGH: 'High risk of degradation',
    }[score.degradation_risk] || score.degradation_risk;

    isEstimated = isEstimated ? `NOTE: No exact dataset match was found for this location. 
        This assessment is based on the nearest matching soil unit 
        and should be treated as an estimate.`
       : ''

    const prompt = `[INST]
        You are an agricultural land advisor helping smallholder farmers and land investors in Nigeria 
        make informed decisions about farmland. Your advice should be practical, clear, and actionable.
        Avoid technical jargon. Write as if speaking directly to the farmer.

        ${estimatedNote}

        LAND ASSESSMENT DATA:
        - Soil Health Rating: ${badgeLabel} (Score: ${score.total_score}/100)
        - Degradation Risk: ${riskLabel}
        - Ecological Zone: ${soilUnit.ecological_zone || 'Not specified'}
        - Drainage: ${soilUnit.drainage || 'Not specified'}
        - Soil pH: ${soilUnit.ph_range || 'Not specified'} (${soilUnit.ph_description || ''})
        - Slope: ${soilUnit.slope || 'Not specified'}
        - Soil Texture: ${soilUnit.soil_texture || 'Not specified'}
        - Soil Depth: ${soilUnit.soil_depth || 'Not specified'}
        - Land Suitability: ${soilUnit.suitability || 'Not specified'}
        - Crops That Grow Well Here: ${soilUnit.major_crops || 'Not specified'}

        Please provide a response in EXACTLY this structure:

        VERDICT
        One sentence summary of whether this land is worth investing in or farming.

        WHAT THIS MEANS FOR YOU
        2-3 sentences explaining what the score means in practical terms for a farmer or land investor. 
        What can they realistically grow? What should they expect?

        MAIN RISKS
        2-3 specific risks this land faces based on its soil properties. 
        Be specific — mention drainage, pH, slope, depth as relevant.

        HOW TO IMPROVE THIS LAND
        3 practical, affordable actions a Nigerian smallholder farmer can take to improve this land.
        Focus on locally available solutions (e.g. compost, cover crops, drainage channels, lime).

        BEST USE OF THIS LAND
        Based on the soil data, what is the single best agricultural use of this land right now?
        Consider both crops and non-crop uses (grazing, agroforestry etc.).

        ${isEstimated ? 'IMPORTANT DISCLAIMER\nThis is an estimated assessment based on nearby soil data. Conduct a physical soil test before making major investment decisions.' : ''}

    [/INST]`;

    return prompt
    
}

// general Purpose prompt builder if location not in dataset
/**
 
 * Uses reverse geocoded location name for context
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} locationHint - e.g. "Northern Nigeria" or "Kano State"
 * @returns {string} prompt
 */
function buildGeneralPrompt(latitude, longitude, locationHint = 'Nigeria') {
    return `[INST]
                You are an agricultural land advisor. A user wants to assess land at coordinates 
                (${latitude}, ${longitude}) in ${locationHint}.

                We do not have specific soil dataset coverage for this exact location.

                Based on your knowledge of agricultural conditions in ${locationHint}, provide general 
                guidance in EXACTLY this structure:

                COVERAGE NOTE
                Explain briefly that this location is outside the current dataset coverage area 
                and this is general guidance only.

                GENERAL LAND CONDITIONS
                What are typical soil and agricultural conditions in this region of Nigeria? 
                2-3 sentences.

                GENERAL RECOMMENDATIONS
                3 practical recommendations for anyone farming or investing in land in this region.

                SUGGESTED NEXT STEPS
                What should this person do to get an accurate assessment of their specific land?
                (e.g. physical soil test, contact local agricultural extension officer)
            [/INST]`;
}

// HuggingFace API Call 
/**
 *
 * @param {string} prompt
 * @returns {{ text: string, responseTimeMs: number }}
 */
async function callHuggingFace(prompt) {
    const startTime = Date.now()

    const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters:{
                max_new_token: 600,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
                return_full_text:false // return generated text without prompt
            },
        }),
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok){
        const errorText = await response.text();
        throw new Error(`HuggingFace API error ${response.status}: ${errorText}`);

    }

    const data = await response.json();

    // Hugging face returns array of generated text
    const generatedText = Array.isArray(data) 
    ? data[0]?.generated_text
    :data.generated_text;

    if (!generatedText){
        throw new Error('HuggungFace returned empty response');
    }

    return{
        text: generatedText.trim(),
        responseTimeMs
    }
    
}

// Main function
/*
**
 * Generate AI explanation for an assessment
 * Updates SoilHealthScore and logs the call to AiExplanationLog

 * @param {object} soilUnit   - Full SoilMappingUnit record
 * @param {object} score      - SoilHealthScore record (must exist in DB)
 * @param {boolean} isEstimated - Whether this used nearest neighbour fallback
 */
async function generateExplanation(soilUnit, score, isEstimated = false) {
  const prompt = buildPrompt(soilUnit, score, isEstimated);
  let rawResponse = null;
  let responseTimeMs = null;
  let status = 'pending';
  let errorMessage = null;
  let explanation = null;

  try {
    const result = await callHuggingFace(prompt);
    rawResponse = result.text;
    responseTimeMs = result.responseTimeMs;
    explanation = result.text;
    status = 'success';

    console.log(`✅ AI explanation generated in ${responseTimeMs}ms`);

  } catch (error) {
    console.error('❌ HuggingFace API failed:', error.message);
    errorMessage = error.message;
    status = 'failed';

    // Fallback — build a structured explanation from raw data
    explanation = buildFallbackExplanation(soilUnit, score, isEstimated);
    status = 'fallback';
  }

  // Update the score record with explanation
  await SoilHealthScore.update(
    {
      ai_plain_explanation: explanation,
      ai_model_used: status === 'success' ? MODEL_NAME : 'fallback',
      ai_explanation_status: status,
    },
    { where: { score_id: score.score_id } }
  );

  // Log every call for transparency
  await AiExplanationLog.create({
    score_id: score.score_id,
    prompt_sent: prompt,
    raw_response: rawResponse,
    model_name: status === 'success' ? MODEL_NAME : 'fallback',
    response_time_ms: responseTimeMs,
    status,
    error_message: errorMessage,
  });

  return explanation;
}

/**
 * Generate a general purpose explanation for locations outside dataset coverage
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} locationHint
 * @returns {string} explanation
 */
async function generateGeneralExplanation(latitude, longitude, locationHint) {
  const prompt = buildGeneralPrompt(latitude, longitude, locationHint);

  try {
    const result = await callHuggingFace(prompt);
    return {
      explanation: result.text,
      source: 'ai_general',
      is_estimated: true,
    };
  } catch (error) {
    console.error('❌ General AI explanation failed:', error.message);
    return {
      explanation: `This location (${latitude}, ${longitude}) is outside our current dataset coverage area. 
        We recommend contacting your local agricultural extension office for a physical soil assessment. 
        You can also reach out to the Federal Ministry of Agriculture and Rural Development for guidance.`,
      source: 'fallback_general',
      is_estimated: true,
    };
  }
}

// ── Fallback Explanation Builder

/**
 * Builds a structured plain text explanation from raw soil data
 * Used when HuggingFace API is unavailable
 *
 * @param {object} soilUnit
 * @param {object} score
 * @param {boolean} isEstimated
 * @returns {string}
 */
function buildFallbackExplanation(soilUnit, score, isEstimated) {
  const badgeMessages = {
    GOLD: 'This is excellent farmland with strong agricultural potential.',
    SILVER: 'This land has moderate agricultural potential and can support farming with proper management.',
    BRONZE: 'This land has significant limitations and requires substantial improvement before farming.',
  };

  const riskMessages = {
    LOW: 'The land shows low risk of long-term degradation.',
    MEDIUM: 'There is moderate risk of degradation — proper land management is recommended.',
    HIGH: 'This land is at high risk of degradation and needs careful management to remain productive.',
  };

  const drainageAdvice = {
    'Well Drained': 'Drainage is good — a wide range of crops can be grown here.',
    'Poorly Drained': 'Poor drainage is a concern. Consider raised beds or drainage channels to manage waterlogging.',
    'Moderately Drained': 'Drainage is moderate. Avoid water-intensive crops in rainy season.',
    'Imperfectly Drained': 'Drainage is imperfect. Water management will be important for good yields.',
    'Shallow Drained': 'Shallow drainage limits root development. Raised bed farming is recommended.',
  };

  const estimatedNote = isEstimated
    ? '\n\nNOTE: This assessment is estimated based on nearby soil data. Conduct a physical soil test before making major investment decisions.'
    : '';

  return `VERDICT
${badgeMessages[score.badge] || 'Assessment complete.'}

SOIL HEALTH SCORE: ${score.total_score}/100 (${score.badge})
${riskMessages[score.degradation_risk] || ''}

LAND PROPERTIES
• Drainage: ${soilUnit.drainage || 'Unknown'}
• Soil pH: ${soilUnit.ph_range || 'Unknown'} — ${soilUnit.ph_description || ''}
• Slope: ${soilUnit.slope || 'Unknown'}
• Soil Texture: ${soilUnit.soil_texture || 'Unknown'}
• Soil Depth: ${soilUnit.soil_depth || 'Unknown'}
• Ecological Zone: ${soilUnit.ecological_zone || 'Unknown'}

DRAINAGE ADVICE
${drainageAdvice[soilUnit.drainage] || 'Assess drainage conditions before planting.'}

CROPS SUITED TO THIS LAND
${soilUnit.major_crops || 'Contact your local agricultural extension office for crop recommendations.'}

LAND SUITABILITY
${soilUnit.suitability || 'Not specified.'}${estimatedNote}`;
}

module.exports = { generateExplanation, generateGeneralExplanation };