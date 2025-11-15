"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const user_model_1 = require("../models/user.model");
const seller_controller_1 = require("../controllers/seller.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const product_validator_1 = require("../validators/product.validator");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
// Apply authentication and seller role check to all routes
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(user_model_1.UserRole.SELLER));
// Seller dashboard
router.get('/dashboard', seller_controller_1.sellerController.getDashboard.bind(seller_controller_1.sellerController));
// Product routes
router.get('/products', seller_controller_1.sellerController.getProducts.bind(seller_controller_1.sellerController));
router.post('/products', (0, validate_middleware_1.validate)(product_validator_1.createProductSchema), seller_controller_1.sellerController.createProduct.bind(seller_controller_1.sellerController));
router.put('/products/:id', (0, validate_middleware_1.validate)(product_validator_1.updateProductSchema), (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), seller_controller_1.sellerController.updateProduct.bind(seller_controller_1.sellerController));
router.delete('/products/:id', (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), seller_controller_1.sellerController.deleteProduct.bind(seller_controller_1.sellerController));
// Order routes
router.get('/orders', seller_controller_1.sellerController.getOrders.bind(seller_controller_1.sellerController));
router.put('/orders/:id/status', (0, validate_middleware_1.validate)(order_validator_1.updateOrderStatusSchema), (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), seller_controller_1.sellerController.updateOrderStatus.bind(seller_controller_1.sellerController));
exports.default = router;
