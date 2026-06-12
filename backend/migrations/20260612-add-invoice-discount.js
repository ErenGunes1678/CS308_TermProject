"use strict";

/**
 * Migration: add discount_code and discount_amount to invoices
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("invoices", "discount_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("invoices", "discount_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("invoices", "discount_amount");
    await queryInterface.removeColumn("invoices", "discount_code");
  },
};
