'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SoilHealthScore extends Model {
    static associate(models) {
      this.belongsTo(models.LandAssessment, {
        foreignKey: 'assessment_id',
        onDelete: 'CASCADE',
      });
      this.belongsTo(models.SoilMappingUnit, {
        foreignKey: 'unit_id',
        onDelete: 'RESTRICT',
      });
      this.hasOne(models.AiExplanationLog, {
        foreignKey: 'score_id',
        onDelete: 'CASCADE',
      });
    }
  }

  SoilHealthScore.init({
    score_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    badge: {
      type: DataTypes.ENUM('GOLD', 'SILVER', 'BRONZE'),
      allowNull: false,
    },
    total_score: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    degradation_risk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: false,
    },
    ai_plain_explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_model_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ai_explanation_status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'fallback'),
      allowNull: false,
      defaultValue: 'pending',
    },
    scored_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'SoilHealthScore',
    tableName: 'soil_health_scores',
    timestamps: true,
  });

  return SoilHealthScore;
};