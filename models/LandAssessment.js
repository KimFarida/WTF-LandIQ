'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LandAssessment extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });
      this.belongsTo(models.SoilMappingUnit, {
        foreignKey: 'unit_id',
        onDelete: 'RESTRICT',
      });
      this.hasOne(models.SoilHealthScore, {
        foreignKey: 'assessment_id',
        onDelete: 'CASCADE',
      });
      this.hasMany(models.ComparisonItem, {
        foreignKey: 'assessment_id',
        onDelete: 'CASCADE',
      });
    }
  }

  LandAssessment.init({
    assessment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    area_hectares: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_saved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_temporary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'LandAssessment',
    tableName: 'land_assessments',
    timestamps: true,
  });

  return LandAssessment;
};