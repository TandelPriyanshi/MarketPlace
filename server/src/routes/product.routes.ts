import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { productIdSchema, createProductSchema, updateProductSchema } from '../validators/product.validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';

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
 *         sellerId:
 *           type: string
 *           format: uuid
 *           description: ID of the seller who owns this product
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
 *           description: When the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the product was last updated
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         error:
 *           type: string
 *   parameters:
 *     productIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: The product ID

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, -price, rating, -rating, date, -date]
 *         description: Sort products by field and order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                   description: Total number of products
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 pages:
 *                   type: integer
 *                   description: Total number of pages
 */
router.get('/', productController.getAllProducts.bind(productController));

// Alias for /products/all
router.get('/all', productController.getAllProducts.bind(productController));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/productIdParam'
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(productIdSchema, 'params'), productController.getProductById.bind(productController));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Seller only)
 *     tags: [Products]
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
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Only sellers can create products
 */
router.post('/', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(createProductSchema, 'body'), 
  productController.createProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productIdParam'
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
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Only the product owner can update it
 *       404:
 *         description: Product not found
 */
router.put('/:id', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(productIdSchema, 'params'),
  validate(updateProductSchema, 'body'), 
  productController.updateProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productIdParam'
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Only the product owner can delete it
 *       404:
 *         description: Product not found
 */
router.delete('/:id', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(productIdSchema, 'params'),
  productController.deleteProduct.bind(productController)
);

export default router;

