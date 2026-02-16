'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ComparisonItem extends Model {
    static associate(models) {
      this.belongsTo(models.Comparison, {
        foreignKey: 'comparison_id',
        onDelete: 'CASCADE',
      });
      this.belongsTo(models.LandAssessment, {
        foreignKey: 'assessment_id',
        onDelete: 'CASCADE',
      });
    }
  }

  ComparisonItem.init({
    item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    comparison_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    display_order: {
      type: DataTypes.TINYINT,
      allowNull: false,
      // 1 or 2 — enforced at service layer 
    },
  }, {
    sequelize,
    modelName: 'ComparisonItem',
    tableName: 'comparison_items',
    timestamps: true,
  });

  return ComparisonItem;
};