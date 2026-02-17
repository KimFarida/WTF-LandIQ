'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('soil_mapping_units', {
      unit_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      mapping_unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ecological_zone: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      geology: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      slope: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      drainage: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ph_range: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      ph_description: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      suitability: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      soil_texture: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      soil_class: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      soil_depth: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      vegetation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      distribution: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      major_crops: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      area_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      geo_boundary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      badge: {
        type: Sequelize.ENUM('GOLD', 'SILVER', 'BRONZE'),
        allowNull: true,
      },
      total_score: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      degradation_risk: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
        allowNull: true,
      },
      risk_factors: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Index on mapping_unit for lookup queries (not unique)
    await queryInterface.addIndex('soil_mapping_units', ['mapping_unit']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('soil_mapping_units');
  },
};