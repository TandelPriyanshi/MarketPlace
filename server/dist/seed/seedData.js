"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedData = void 0;
const uuid_1 = require("uuid");
const user_model_1 = require("../models/user.model");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const seller_model_1 = require("../models/seller.model");
const deliveryPerson_model_1 = require("../models/deliveryPerson.model");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
exports.seedData = {
    users: [
        {
            id: (0, uuid_1.v4)(),
            email: 'seller1@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Seller One',
            phone: '+1234567890',
            role: user_model_1.UserRole.SELLER,
            isActive: true,
        },
        {
            id: (0, uuid_1.v4)(),
            email: 'seller2@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Seller Two',
            phone: '+1234567891',
            role: user_model_1.UserRole.SELLER,
            isActive: true,
        },
        {
            id: (0, uuid_1.v4)(),
            email: 'customer1@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Customer One',
            phone: '+1234567892',
            role: user_model_1.UserRole.CUSTOMER,
            isActive: true,
        },
        {
            id: (0, uuid_1.v4)(),
            email: 'customer2@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Customer Two',
            phone: '+1234567893',
            role: user_model_1.UserRole.CUSTOMER,
            isActive: true,
        },
        {
            id: (0, uuid_1.v4)(),
            email: 'delivery@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Delivery Person',
            phone: '+1234567894',
            role: user_model_1.UserRole.DELIVERY_PERSON,
            isActive: true,
        },
        {
            id: (0, uuid_1.v4)(),
            email: 'salesman@example.com',
            passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
            name: 'Salesman One',
            phone: '+1234567895',
            role: user_model_1.UserRole.SALESMAN, // Using SALESMAN as placeholder for salesman
            isActive: true,
        },
    ],
    sellers: [
        {
            userId: '', // Will be set from users
            businessName: 'Best Electronics Store',
            businessDescription: 'Your one-stop shop for all electronics',
            businessAddress: '123 Main St, City, State 12345',
            businessPhone: '+1234567890',
            businessEmail: 'seller1@example.com',
            taxId: 'TAX123456',
            status: seller_model_1.SellerStatus.ACTIVE,
            rating: 4.5,
            totalSales: 150,
        },
        {
            userId: '', // Will be set from users
            businessName: 'Fashion Hub',
            businessDescription: 'Trendy fashion for everyone',
            businessAddress: '456 Oak Ave, City, State 12345',
            businessPhone: '+1234567891',
            businessEmail: 'seller2@example.com',
            taxId: 'TAX123457',
            status: seller_model_1.SellerStatus.ACTIVE,
            rating: 4.8,
            totalSales: 200,
        },
    ],
    deliveryPersons: [
        {
            userId: '', // Will be set from users
            vehicleType: 'Motorcycle',
            vehicleNumber: 'MC-1234',
            licenseNumber: 'DL-123456',
            status: deliveryPerson_model_1.DeliveryPersonStatus.ACTIVE,
            rating: 4.7,
            totalDeliveries: 500,
            totalEarnings: 15000.00,
        },
    ],
    salesmen: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Salesman One',
            email: 'salesman@example.com',
            phone: '+1234567895',
            isActive: true,
            lastActiveAt: new Date(),
        },
    ],
    products: [
        {
            sellerId: '', // Will be set from sellers
            name: 'Smartphone X',
            sku: 'SPX-001',
            description: 'Latest smartphone with advanced features',
            price: 599.99,
            stock: 50,
            images: ['https://example.com/images/phone1.jpg'],
            status: product_model_1.ProductStatus.PUBLISHED,
        },
        {
            sellerId: '', // Will be set from sellers
            name: 'Laptop Pro',
            sku: 'LP-001',
            description: 'High-performance laptop for professionals',
            price: 1299.99,
            stock: 30,
            images: ['https://example.com/images/laptop1.jpg'],
            status: product_model_1.ProductStatus.PUBLISHED,
        },
        {
            sellerId: '', // Will be set from sellers
            name: 'Designer T-Shirt',
            sku: 'TS-001',
            description: 'Premium cotton t-shirt',
            price: 29.99,
            stock: 100,
            images: ['https://example.com/images/tshirt1.jpg'],
            status: product_model_1.ProductStatus.PUBLISHED,
        },
        {
            sellerId: '', // Will be set from sellers
            name: 'Jeans Classic',
            sku: 'JN-001',
            description: 'Classic fit jeans',
            price: 49.99,
            stock: 75,
            images: ['https://example.com/images/jeans1.jpg'],
            status: product_model_1.ProductStatus.PUBLISHED,
        },
    ],
    beats: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Downtown Beat',
            description: 'Coverage area for downtown stores',
            salesmanId: '', // Will be set from salesmen
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            status: beat_model_1.BeatStatus.ACTIVE,
            route: {
                coordinates: [
                    { lat: 40.7128, lng: -74.0060 },
                    { lat: 40.7580, lng: -73.9855 },
                ],
                waypoints: [],
            },
        },
    ],
    stores: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Main Street Store',
            address: '789 Main St, City, State 12345',
            contactPerson: 'John Doe',
            phone: '+1987654321',
            email: 'store1@example.com',
            latitude: 40.7128,
            longitude: -74.0060,
            type: store_model_1.StoreType.RETAIL,
            isActive: true,
            beatId: '', // Will be set from beats
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Oak Avenue Store',
            address: '321 Oak Ave, City, State 12345',
            contactPerson: 'Jane Smith',
            phone: '+1987654322',
            email: 'store2@example.com',
            latitude: 40.7580,
            longitude: -73.9855,
            type: store_model_1.StoreType.RETAIL,
            isActive: true,
            beatId: '', // Will be set from beats
        },
    ],
    orders: [
        {
            id: (0, uuid_1.v4)(),
            userId: '', // Will be set from users (customer1)
            orderNumber: `ORD-${Date.now()}-001`,
            totalAmount: 629.98,
            status: order_model_1.OrderStatus.PENDING,
            paymentStatus: order_model_1.PaymentStatus.PENDING,
            deliveryStatus: order_model_1.DeliveryStatus.PENDING,
            shippingAddress: '123 Customer St, City, State 12345',
            billingAddress: '123 Customer St, City, State 12345',
        },
    ],
    orderItems: [
        {
            id: (0, uuid_1.v4)(),
            orderId: '', // Will be set from orders
            productId: '', // Will be set from products
            sellerId: '', // Will be set from sellers
            quantity: 1,
            price: 599.99,
            status: order_model_1.OrderStatus.PENDING,
            isCancelled: false,
        },
        {
            id: (0, uuid_1.v4)(),
            orderId: '', // Will be set from orders
            productId: '', // Will be set from products
            sellerId: '', // Will be set from sellers
            quantity: 1,
            price: 29.99,
            status: order_model_1.OrderStatus.PENDING,
            isCancelled: false,
        },
    ],
};
