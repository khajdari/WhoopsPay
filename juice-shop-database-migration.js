// File: data/static/orders.sql
// Add these columns to your existing orders table

ALTER TABLE Orders ADD COLUMN paymentTransactionId VARCHAR(255);
ALTER TABLE Orders ADD COLUMN paymentStatus VARCHAR(50) DEFAULT 'pending';

-- Or create a new migration file: migrations/YYYYMMDDHHMMSS-add-paypwned-fields.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'paymentTransactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'paymentStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'paymentTransactionId');
    await queryInterface.removeColumn('Orders', 'paymentStatus');
  }
};