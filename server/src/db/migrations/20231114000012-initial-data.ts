// server/src/db/migrations/20231114000012-initial-data.ts
'use strict';

import bcrypt from 'bcryptjs';

enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
  SALESMAN = 'salesman',
  DELIVERY_PERSON = 'delivery_person'
}

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    const salt = await bcrypt.genSalt(10);
    
    // Helper function to create or update user
    const createOrUpdateUser = async (userData: any) => {
      const existingUser = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE id = :id`,
        {
          replacements: { id: userData.id },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      if (existingUser.length > 0) {
        // Update existing user
        await queryInterface.sequelize.query(
          `UPDATE users SET 
            email = :email,
            password = :password,
            firstName = :firstName,
            lastName = :lastName,
            phone = :phone,
            role = :role,
            isActive = :isActive,
            isEmailVerified = :isEmailVerified,
            updatedAt = :updatedAt
          WHERE id = :id`,
          {
            replacements: {
              ...userData,
              updatedAt: new Date()
            },
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      } else {
        // Insert new user
        await queryInterface.bulkInsert('users', [userData]);
      }
    };

    // Admin user
    await createOrUpdateUser({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@marketplace.com',
      password: await bcrypt.hash('admin123', salt),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
      created_at: new Date(),
      updatedAt: new Date(),
    });

    // Seller user
    const sellerId = '00000000-0000-0000-0000-000000000002';
    await createOrUpdateUser({
      id: sellerId,
      email: 'seller@example.com',
      password: await bcrypt.hash('seller123', salt),
      firstName: 'Sample',
      lastName: 'Seller',
      phone: '+1234567891',
      role: UserRole.SELLER,
      isActive: true,
      isEmailVerified: true,
      created_at: new Date(),
      updatedAt: new Date(),
    });

    // Seller profile
    const existingSeller = await queryInterface.sequelize.query(
      `SELECT id FROM sellers WHERE id = :id`,
      {
        replacements: { id: '00000000-0000-0000-0000-000000000101' },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existingSeller.length === 0) {
      await queryInterface.bulkInsert('sellers', [{
        id: '00000000-0000-0000-0000-000000000101',
        userId: sellerId,
        businessName: 'Sample Store',
        businessDescription: 'A sample store for demonstration purposes',
        businessAddress: '123 Main St, City, Country',
        businessPhone: '+1234567890',
        isVerified: true,
        created_at: new Date(),
        updatedAt: new Date(),
      }]);
    }

    // Delivery person user
    const deliveryPersonId = '00000000-0000-0000-0000-000000000003';
    await createOrUpdateUser({
      id: deliveryPersonId,
      email: 'delivery@example.com',
      password: await bcrypt.hash('delivery123', salt),
      firstName: 'Delivery',
      lastName: 'Person',
      phone: '+1234567892',
      role: UserRole.DELIVERY_PERSON,
      isActive: true,
      isEmailVerified: true,
      created_at: new Date(),
      updatedAt: new Date(),
    });

    // Delivery person profile
    const existingDeliveryPerson = await queryInterface.sequelize.query(
      `SELECT id FROM delivery_persons WHERE id = :id`,
      {
        replacements: { id: '00000000-0000-0000-0000-000000000201' },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existingDeliveryPerson.length === 0) {
      await queryInterface.bulkInsert('delivery_persons', [{
        id: '00000000-0000-0000-0000-000000000201',
        userId: deliveryPersonId,
        vehicleType: 'bike',
        status: 'active',
        created_at: new Date(),
        updatedAt: new Date(),
      }]);
    }

    // Salesman user
    const salesmanId = '00000000-0000-0000-0000-000000000004';
    await createOrUpdateUser({
      id: salesmanId,
      email: 'salesman@example.com',
      password: await bcrypt.hash('salesman123', salt),
      firstName: 'Salesman',
      lastName: 'User',
      phone: '+1234567893',
      role: UserRole.SALESMAN,
      isActive: true,
      isEmailVerified: true,
      created_at: new Date(),
      updatedAt: new Date(),
    });

    // Salesman profile
    const existingSalesman = await queryInterface.sequelize.query(
      `SELECT id FROM salesmen WHERE id = :id`,
      {
        replacements: { id: '00000000-0000-0000-0000-000000000301' },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existingSalesman.length === 0) {
      await queryInterface.bulkInsert('salesmen', [{
        id: '00000000-0000-0000-0000-000000000301',
        userId: salesmanId,
        employeeId: 'EMP001',
        joiningDate: new Date().toISOString().split('T')[0],
        department: 'Sales',
        designation: 'Sales Executive',
        isActive: true,
        created_at: new Date(),
        updatedAt: new Date(),
      }]);
    }

    // Customer user
    await createOrUpdateUser({
      id: '00000000-0000-0000-0000-000000000005',
      email: 'customer@example.com',
      password: await bcrypt.hash('customer123', salt),
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567894',
      role: UserRole.CUSTOMER,
      isActive: true,
      isEmailVerified: true,
      created_at: new Date(),
      updatedAt: new Date(),
    });

    console.log('Initial data seeded successfully');
  },

  down: async (queryInterface: any, Sequelize: any) => {
    // Delete all data in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('salesmen', null, {});
    await queryInterface.bulkDelete('delivery_persons', null, {});
    await queryInterface.bulkDelete('sellers', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};