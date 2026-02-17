'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_explanation_logs', {
      log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      score_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'soil_health_scores',
          key: 'score_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      prompt_sent: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      raw_response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      model_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      response_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'fallback'),
        allowNull: false,
      },
      error_message: {
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

    await queryInterface.addIndex('ai_explanation_logs', ['score_id']);
    await queryInterface.addIndex('ai_explanation_logs', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_explanation_logs');
  },
};