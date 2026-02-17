'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Read GeoJSON file
    const geojsonPath = path.join(__dirname, '../data/landiq_soil_data.geojson');
    
    if (!fs.existsSync(geojsonPath)) {
      throw new Error(`GeoJSON file not found at ${geojsonPath}.`);
    }

    const geojsonContent = fs.readFileSync(geojsonPath, 'utf-8');
    const geojson = JSON.parse(geojsonContent);

    console.log(`Loading ${geojson.features.length} soil mapping units...`);

    // Map GeoJSON features to db records
    const records = geojson.features.map((feature, index) => {
      const props = feature.properties;

      return {
        unit_id: uuidv4(),
        mapping_unit: props.mapping_unit || null,
        ecological_zone: props.ecological_zone || null,
        geology: props.geology || null,
        slope: props.slope || null,
        drainage: props.drainage || null,
        ph_range: props.ph_range || null,
        ph_description: props.ph_description || null,
        suitability: props.suitability || null,
        soil_texture: props.soil_texture || null,
        soil_class: props.soil_class || null,
        soil_depth: props.soil_depth || null,
        vegetation: props.vegetation || null,
        distribution: props.distribution || null,
        major_crops: props.major_crops || null,
        area_percentage: props.area_percentage || null,
        geo_boundary: JSON.stringify(feature.geometry), // Store geometry as JSON string
        badge: props.badge || null,
        total_score: props.total_score || null,
        degradation_risk: props.degradation_risk || null,
        risk_factors: props.risk_factors || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    // Bulk insert — batch of 100 at a time to avoid overwhelming MySQL
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await queryInterface.bulkInsert('soil_mapping_units', batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
    }

    console.log(`✅ Successfully seeded ${records.length} soil mapping units`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('soil_mapping_units', null, {});
    console.log('✅ Deleted all soil mapping units');
  }
};