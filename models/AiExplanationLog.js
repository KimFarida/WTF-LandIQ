'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AiExplanationLog extends Model {
    static associate(models) {
      this.belongsTo(models.SoilHealthScore, {
        foreignKey: 'score_id',
        onDelete: 'CASCADE',
      });
    }
  }

  AiExplanationLog.init({
    log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    score_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    prompt_sent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    raw_response: {
      type: DataTypes.TEXT,
      allowNull: true,  // null if call failed before response
    },
    model_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    response_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,  // null if call failed
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'fallback'),
      allowNull: false,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,  // null if call succeeded
    },
  }, {
    sequelize,
    modelName: 'AiExplanationLog',
    tableName: 'ai_explanation_logs',
    timestamps: true,
  });

  return AiExplanationLog;
};