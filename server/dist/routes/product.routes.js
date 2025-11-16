"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const product_validator_1 = require("../validators/product.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
// Public routes - no authentication required
router.get('/', product_controller_1.productController.getAllProducts.bind(product_controller_1.productController));
router.get('/all', product_controller_1.productController.getAllProducts.bind(product_controller_1.productController));
router.get('/:id', (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), product_controller_1.productController.getProductById.bind(product_controller_1.productController));
// Protected routes - authentication and seller role required
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)([user_model_1.UserRole.SELLER]), (0, validate_middleware_1.validate)(product_validator_1.createProductSchema, 'body'), product_controller_1.productController.createProduct.bind(product_controller_1.productController));
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)([user_model_1.UserRole.SELLER]), (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), (0, validate_middleware_1.validate)(product_validator_1.updateProductSchema, 'body'), product_controller_1.productController.updateProduct.bind(product_controller_1.productController));
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)([user_model_1.UserRole.SELLER]), (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), product_controller_1.productController.deleteProduct.bind(product_controller_1.productController));
exports.default = router;
