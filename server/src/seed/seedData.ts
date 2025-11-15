import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../models/user.model';
import { ProductStatus } from '../models/product.model';
import { OrderStatus, PaymentStatus, DeliveryStatus } from '../models/order.model';
import { SellerStatus } from '../models/seller.model';
import { DeliveryPersonStatus } from '../models/deliveryPerson.model';
import { BeatStatus } from '../models/beat.model';
import { StoreType } from '../models/store.model';

export const seedData = {
  users: [
    {
      id: uuidv4(),
      email: 'seller1@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Seller One',
      phone: '+1234567890',
      role: UserRole.SELLER as any,
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'seller2@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Seller Two',
      phone: '+1234567891',
      role: UserRole.SELLER as any,
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'customer1@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Customer One',
      phone: '+1234567892',
      role: UserRole.CUSTOMER as any,
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'customer2@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Customer Two',
      phone: '+1234567893',
      role: UserRole.CUSTOMER as any,
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'delivery@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Delivery Person',
      phone: '+1234567894',
      role: UserRole.DELIVERY_PERSON as any,
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'salesman@example.com',
      passwordHash: '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
      name: 'Salesman One',
      phone: '+1234567895',
      role: UserRole.SALESMAN as any, // Using SALESMAN as placeholder for salesman
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
      status: SellerStatus.ACTIVE,
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
      status: SellerStatus.ACTIVE,
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
      status: DeliveryPersonStatus.ACTIVE,
      rating: 4.7,
      totalDeliveries: 500,
      totalEarnings: 15000.00,
    },
  ],

  salesmen: [
    {
      id: uuidv4(),
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
      status: ProductStatus.PUBLISHED,
    },
    {
      sellerId: '', // Will be set from sellers
      name: 'Laptop Pro',
      sku: 'LP-001',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      stock: 30,
      images: ['https://example.com/images/laptop1.jpg'],
      status: ProductStatus.PUBLISHED,
    },
    {
      sellerId: '', // Will be set from sellers
      name: 'Designer T-Shirt',
      sku: 'TS-001',
      description: 'Premium cotton t-shirt',
      price: 29.99,
      stock: 100,
      images: ['https://example.com/images/tshirt1.jpg'],
      status: ProductStatus.PUBLISHED,
    },
    {
      sellerId: '', // Will be set from sellers
      name: 'Jeans Classic',
      sku: 'JN-001',
      description: 'Classic fit jeans',
      price: 49.99,
      stock: 75,
      images: ['https://example.com/images/jeans1.jpg'],
      status: ProductStatus.PUBLISHED,
    },
  ],

  beats: [
    {
      id: uuidv4(),
      name: 'Downtown Beat',
      description: 'Coverage area for downtown stores',
      salesmanId: '', // Will be set from salesmen
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: BeatStatus.ACTIVE,
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
      id: uuidv4(),
      name: 'Main Street Store',
      address: '789 Main St, City, State 12345',
      contactPerson: 'John Doe',
      phone: '+1987654321',
      email: 'store1@example.com',
      latitude: 40.7128,
      longitude: -74.0060,
      type: StoreType.RETAIL,
      isActive: true,
      beatId: '', // Will be set from beats
    },
    {
      id: uuidv4(),
      name: 'Oak Avenue Store',
      address: '321 Oak Ave, City, State 12345',
      contactPerson: 'Jane Smith',
      phone: '+1987654322',
      email: 'store2@example.com',
      latitude: 40.7580,
      longitude: -73.9855,
      type: StoreType.RETAIL,
      isActive: true,
      beatId: '', // Will be set from beats
    },
  ],

  orders: [
    {
      id: uuidv4(),
      userId: '', // Will be set from users (customer1)
      orderNumber: `ORD-${Date.now()}-001`,
      totalAmount: 629.98,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      deliveryStatus: DeliveryStatus.PENDING,
      shippingAddress: '123 Customer St, City, State 12345',
      billingAddress: '123 Customer St, City, State 12345',
    },
  ],

  orderItems: [
    {
      id: uuidv4(),
      orderId: '', // Will be set from orders
      productId: '', // Will be set from products
      sellerId: '', // Will be set from sellers
      quantity: 1,
      price: 599.99,
      status: OrderStatus.PENDING,
      isCancelled: false,
    },
    {
      id: uuidv4(),
      orderId: '', // Will be set from orders
      productId: '', // Will be set from products
      sellerId: '', // Will be set from sellers
      quantity: 1,
      price: 29.99,
      status: OrderStatus.PENDING,
      isCancelled: false,
    },
  ],
};

