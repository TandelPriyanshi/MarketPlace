"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
// Public routes - no authentication required
router.get('/', product_controller_1.productController.getAllProducts.bind(product_controller_1.productController));
router.get('/:id', (0, validate_middleware_1.validate)(product_validator_1.productIdSchema, 'params'), product_controller_1.productController.getProductById.bind(product_controller_1.productController));
exports.default = router;
