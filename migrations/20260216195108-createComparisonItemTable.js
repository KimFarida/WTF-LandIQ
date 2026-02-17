'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comparison_items', {
      item_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      comparison_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'comparisons',
          key: 'comparison_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      display_order: {
        type: Sequelize.TINYINT,
        allowNull: false,
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

    await queryInterface.addIndex('comparison_items', ['comparison_id']);
    await queryInterface.addIndex('comparison_items', ['assessment_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comparison_items');
  },
};