import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path, { join } from 'path';
import { DeliveryStatus } from '../models/order.model';

// const __filename = path.basename(import.meta.url || '');
const __dirnameFix = path.resolve();

// Define the Swagger specification
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Marketplace API',
    version: '1.0.0',
    description: 'API documentation for the Marketplace application',
    contact: {
      name: 'API Salesman',
      email: 'salesman@marketplace.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and user management' },
    { name: 'Sellers', description: 'Seller-specific operations' },
    { name: 'Customers', description: 'Customer-specific operations' },
    { name: 'Delivery', description: 'Delivery management' },
    { name: 'Sales', description: 'Sales and order management' },
    { name: 'Products', description: 'Product management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'seller', 'customer'] },
          phone: { type: 'string' },
          isActive: { type: 'boolean', default: true },
          created_at: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', default: false },
          status: { type: 'string', enum: ['error', 'fail'] },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                param: { type: 'string' },
                message: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
          stack: {
            type: 'string',
            description: 'Only shown in development environment',
          },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          uploadedById: { type: 'string', format: 'uuid' },
          fileName: { type: 'string' },
          filePath: { type: 'string' },
          mimeType: { type: 'string' },
          type: {
            type: 'string',
            enum: ['signature', 'delivery_proof', 'return_proof'],
          },
          notes: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          deliveryStatus: {
            type: 'string',
            enum: Object.values(DeliveryStatus),
          },
          deliveryPersonId: { type: 'string', format: 'uuid' },
          deliveryDate: { type: 'string', format: 'date-time' },
          deliveryNotes: { type: 'string' },
          deliveryPerson: { $ref: '#/components/schemas/User' },
          attachments: {
            type: 'array',
            items: { $ref: '#/components/schemas/Attachment' },
          },
        },
      },
    },
  },
};

// Initialize Swagger
export const initializeSwagger = (app: Express): void => {
  // Generate Swagger documentation
  const specs = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: [
      join(__dirnameFix, 'src/routes/*.ts'),
      join(__dirnameFix, 'src/models/*.ts'),
      join(__dirnameFix, 'src/validations/*.ts'),
    ],
  });

  // Add API documentation route
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Marketplace API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      customfavIcon: '/favicon.ico',
    })
  );

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 API Documentation available at /api-docs');
  console.log(
    `📚 Docs available at http://localhost:${process.env.PORT || 3000}/api-docs`
  );
};

export { initializeSwagger as setupSwagger };
