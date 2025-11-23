import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';
import { sellerController } from '../controllers/seller.controller';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productIdSchema } from '../validators/product.validator';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     SellerDashboard:
 *       type: object
 *       properties:
 *         totalProducts:
 *           type: integer
 *           description: Total number of products listed by the seller
 *         activeProducts:
 *           type: integer
 *           description: Number of active products
 *         outOfStockProducts:
 *           type: integer
 *           description: Number of products that are out of stock
 *         totalOrders:
 *           type: integer
 *           description: Total number of orders
 *         pendingOrders:
 *           type: integer
 *           description: Number of pending orders
 *         completedOrders:
 *           type: integer
 *           description: Number of completed orders
 *         totalRevenue:
 *           type: number
 *           format: float
 *           description: Total revenue generated
 *         recentOrders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *         topSellingProducts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Price of the product
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: Available quantity in stock
 *         category:
 *           type: string
 *           description: Category of the product
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Array of image URLs
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active and visible to customers
 *         averageRating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating of the product
 *         reviewCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of reviews for this product
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customerId:
 *           type: string
 *           format: uuid
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         error:
 *           type: string

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller operations
 */

// Apply authentication and seller role check to all routes
router.use(authenticate, requireRole(UserRole.SELLER));

/**
 * @swagger
 * /api/seller/dashboard:
 *   get:
 *     summary: Get seller dashboard data
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerDashboard'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 */
router.get('/dashboard', sellerController.getDashboard.bind(sellerController));

/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Get all products for the logged-in seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, OUT_OF_STOCK]
 *         description: Filter products by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 */
router.get('/products', sellerController.getProducts.bind(sellerController));

/**
 * @swagger
 * /api/seller/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 */
router.post('/products', validate(createProductSchema), sellerController.createProduct.bind(sellerController));

/**
 * @swagger
 * /api/seller/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required or not the product owner
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', validate(updateProductSchema), validate(productIdSchema, 'params'), sellerController.updateProduct.bind(sellerController));

/**
 * @swagger
 * /api/seller/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required or not the product owner
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', validate(productIdSchema, 'params'), sellerController.deleteProduct.bind(sellerController));

/**
 * @swagger
 * /api/seller/orders:
 *   get:
 *     summary: Get all orders for the seller's products
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter orders by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 */
router.get('/orders', sellerController.getOrders.bind(sellerController));

/**
 * @swagger
 * /api/seller/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *               trackingNumber:
 *                 type: string
 *                 description: Required when status is SHIPPED
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status transition or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required or not the product owner
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status', validate(updateOrderStatusSchema), validate(productIdSchema, 'params'), sellerController.updateOrderStatus.bind(sellerController));

export default router;
