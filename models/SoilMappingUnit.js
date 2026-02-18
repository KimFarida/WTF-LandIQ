'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SoilMappingUnit extends Model {
    static associate(models) {
      this.hasMany(models.LandAssessment, {
        foreignKey: 'unit_id',
        onDelete: 'RESTRICT',
      });
      this.hasMany(models.SoilHealthScore, {
        foreignKey: 'unit_id',
        onDelete: 'RESTRICT',
      });
    }
  }

  SoilMappingUnit.init({
    unit_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    mapping_unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    ecological_zone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    geology: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    slope: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    drainage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ph_range: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    ph_description: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    suitability: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    soil_texture: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    soil_class: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    soil_depth: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vegetation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    distribution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    major_crops: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    area_percentage: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    geo_boundary: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    badge: {
      type: DataTypes.ENUM('GOLD', 'SILVER', 'BRONZE'),
      allowNull: true,
    },
    total_score: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    degradation_risk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: true,
    },
    risk_factors: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'SoilMappingUnit',
    tableName: 'soil_mapping_units',
    timestamps: true,
  });

  return SoilMappingUnit;
};