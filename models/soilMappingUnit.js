'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SoilMappingUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.LandAssessment, {
        foreignKey: 'unit_id',
        });
      this.hasMany(models.SoilHealthScore, {
        foreignKey: 'unit_id',
      });
    }
  }
  SoilMappingUnit.init({
    unit_id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,

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
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    soil_texture: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    soil_class: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    geo_boundary: {
      type: DataTypes.TEXT,
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
    degradation_risk:{
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
  });
  return SoilMappingUnit;
};