'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comparison extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });
      this.hasMany(models.ComparisonItem, {
        foreignKey: 'comparison_id',
        onDelete: 'CASCADE',
      });
    }
  }

  Comparison.init({
    comparison_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comparison_name: {
      type: DataTypes.STRING(100),
      allowNull: true,  
    },
  }, {
    sequelize,
    modelName: 'Comparison',
    tableName: 'comparisons',
    timestamps: true,
  });

  return Comparison;
};