'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('soil_health_scores', {
      score_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      assessment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'land_assessments',
          key: 'assessment_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'soil_mapping_units',
          key: 'unit_id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      badge: {
        type: Sequelize.ENUM('GOLD', 'SILVER', 'BRONZE'),
        allowNull: false,
      },
      total_score: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      degradation_risk: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
        allowNull: false,
      },
      ai_plain_explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ai_model_used: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ai_explanation_status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'fallback'),
        allowNull: false,
        defaultValue: 'pending',
      },
      scored_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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

    await queryInterface.addIndex('soil_health_scores', ['assessment_id']);
    await queryInterface.addIndex('soil_health_scores', ['unit_id']);
    await queryInterface.addIndex('soil_health_scores', ['badge']);
    await queryInterface.addIndex('soil_health_scores', ['ai_explanation_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('soil_health_scores');
  },
};