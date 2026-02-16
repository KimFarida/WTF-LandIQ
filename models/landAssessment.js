'use strict';
const {
  Model
} = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {

    // Step 1 — Rename id to assessment_id
    await queryInterface.renameColumn('land_assessments', 'id', 'assessment_id');

    // Step 2 — Change type from INTEGER to UUID
    await queryInterface.changeColumn('land_assessments', 'assessment_id', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    });

    // Fix decimal precision
    await queryInterface.changeColumn('land_assessments', 'latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: false,
    });

    await queryInterface.changeColumn('land_assessments', 'longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: false,
    });

    await queryInterface.changeColumn('land_assessments', 'area_hectares', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    // Fix booleans
    await queryInterface.changeColumn('land_assessments', 'is_saved', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.changeColumn('land_assessments', 'is_temporary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

  },

  async down(queryInterface, Sequelize) {

    // Revert booleans
    await queryInterface.changeColumn('land_assessments', 'is_saved', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.changeColumn('land_assessments', 'is_temporary', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });

    // Revert decimals
    await queryInterface.changeColumn('land_assessments', 'latitude', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });

    await queryInterface.changeColumn('land_assessments', 'longitude', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });

    await queryInterface.changeColumn('land_assessments', 'area_hectares', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });

    // Revert assessment_id back to id INTEGER
    await queryInterface.changeColumn('land_assessments', 'assessment_id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    });

    await queryInterface.renameColumn('land_assessments', 'assessment_id', 'id');

  }
};