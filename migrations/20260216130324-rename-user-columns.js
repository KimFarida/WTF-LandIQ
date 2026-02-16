'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn('Users', 'firstName', 'first_name');
    await queryInterface.renameColumn('Users', 'lastName', 'last_name');
    await queryInterface.renameColumn('Users', 'phoneNumber', 'phone_number');
    await queryInterface.renameColumn('Users', 'passwordHash', 'password_hash');
    await queryInterface.renameColumn('Users', 'jwtRefreshToken', 'jwt_refresh_token');
    await queryInterface.renameColumn('Users', 'createdAt', 'created_at');
    await queryInterface.renameColumn('Users', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('Users', 'first_name', 'firstName');
    await queryInterface.renameColumn('Users', 'last_name', 'lastName');
    await queryInterface.renameColumn('Users', 'phone_number', 'phoneNumber');
    await queryInterface.renameColumn('Users', 'password_hash', 'passwordHash');
    await queryInterface.renameColumn('Users', 'jwt_refresh_token', 'jwtRefreshToken');
    await queryInterface.renameColumn('Users', 'created_at', 'createdAt');
    await queryInterface.renameColumn('Users', 'updated_at', 'updatedAt');
  }
};
