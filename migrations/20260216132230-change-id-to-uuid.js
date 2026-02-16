'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     * 
     */

     // Remove the existing id column (and its primary key status)
    await queryInterface.removeColumn('Users', 'id');

    // Add the new id column as a UUID
    await queryInterface.addColumn('Users', 'id', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4, 
      primaryKey: true,
      allowNull: false
    });
  
  },

  

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Users', 'id');
    await queryInterface.addColumn('Users', 'id', {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    });
  }
};
