'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('land_assessments', {
      assessment_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
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
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      area_hectares: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_saved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_temporary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      user_notes: {
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

    await queryInterface.addIndex('land_assessments', ['user_id']);
    await queryInterface.addIndex('land_assessments', ['unit_id']);
    await queryInterface.addIndex('land_assessments', ['is_temporary', 'expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('land_assessments');
  },
};