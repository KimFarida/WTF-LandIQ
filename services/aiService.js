const { SoilHealthScore, AiExplainationLog } = require('../models')

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

