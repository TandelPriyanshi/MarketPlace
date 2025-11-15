"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.initializeSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importStar(require("path"));
const order_model_1 = require("../models/order.model");
// const __filename = path.basename(import.meta.url || '');
const __dirnameFix = path_1.default.resolve();
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
                description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
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
                    createdAt: { type: 'string', format: 'date-time' },
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
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Order: {
                type: 'object',
                properties: {
                    deliveryStatus: {
                        type: 'string',
                        enum: Object.values(order_model_1.DeliveryStatus),
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
const initializeSwagger = (app) => {
    // Generate Swagger documentation
    const specs = (0, swagger_jsdoc_1.default)({
        definition: swaggerDefinition,
        apis: [
            (0, path_1.join)(__dirnameFix, 'src/routes/*.ts'),
            (0, path_1.join)(__dirnameFix, 'src/models/*.ts'),
            (0, path_1.join)(__dirnameFix, 'src/validations/*.ts'),
        ],
    });
    // Add API documentation route
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
        explorer: true,
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Marketplace API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
        customfavIcon: '/favicon.ico',
    }));
    // Serve Swagger JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
    console.log('📚 API Documentation available at /api-docs');
    console.log(`📚 Docs available at http://localhost:${process.env.PORT || 3000}/api-docs`);
};
exports.initializeSwagger = initializeSwagger;
exports.setupSwagger = exports.initializeSwagger;
