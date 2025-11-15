// server/src/db/migrations/20231114000012-initial-data.js
'use strict';
const { hashPassword } = require('../../utils/auth.util');
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create admin user
        const adminPassword = await hashPassword('admin123');
        const [adminId] = await queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-0000-0000-000000000001',
                email: 'admin@marketplace.com',
                password: adminPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], { returning: ['id'] });
        // Create a sample seller
        const sellerPassword = await hashPassword('seller123');
        const [sellerId] = await queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-0000-0000-000000000002',
                email: 'seller@example.com',
                password: sellerPassword,
                firstName: 'Sample',
                lastName: 'Seller',
                role: 'seller',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], { returning: ['id'] });
        // Create seller profile
        await queryInterface.bulkInsert('sellers', [
            {
                id: '00000000-0000-0000-0000-000000000101',
                userId: sellerId.id,
                businessName: 'Sample Store',
                businessDescription: 'A sample store for demonstration purposes',
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        // Create a sample delivery person
        const deliveryPassword = await hashPassword('delivery123');
        const [deliveryId] = await queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-0000-0000-000000000003',
                email: 'delivery@example.com',
                password: deliveryPassword,
                firstName: 'Delivery',
                lastName: 'Person',
                role: 'delivery_person',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], { returning: ['id'] });
        // Create delivery person profile
        await queryInterface.bulkInsert('delivery_persons', [
            {
                id: '00000000-0000-0000-0000-000000000201',
                userId: deliveryId.id,
                vehicleType: 'bike',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        // Create a sample salesman
        const salesmanPassword = await hashPassword('salesman123');
        const [salesmanId] = await queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-0000-0000-000000000004',
                email: 'salesman@example.com',
                password: salesmanPassword,
                firstName: 'Sales',
                lastName: 'Person',
                role: 'salesman',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], { returning: ['id'] });
        // Create salesman profile
        await queryInterface.bulkInsert('salesmen', [
            {
                id: '00000000-0000-0000-0000-000000000301',
                userId: salesmanId.id,
                employeeId: 'EMP001',
                joiningDate: new Date(),
                department: 'Sales',
                designation: 'Sales Executive',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        // Create a sample customer
        const customerPassword = await hashPassword('customer123');
        await queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-0000-0000-000000000005',
                email: 'customer@example.com',
                password: customerPassword,
                firstName: 'John',
                lastName: 'Doe',
                role: 'customer',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        console.log('Initial data seeded successfully');
    },
    down: async (queryInterface, Sequelize) => {
        // Delete all data in reverse order to respect foreign key constraints
        await queryInterface.bulkDelete('salesmen', null, {});
        await queryInterface.bulkDelete('delivery_persons', null, {});
        await queryInterface.bulkDelete('sellers', null, {});
        await queryInterface.bulkDelete('users', null, {});
    },
};
