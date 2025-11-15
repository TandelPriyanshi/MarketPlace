"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_controller_1 = require("../controllers/order.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Order routes
router.get('/', order_controller_1.orderController.getAllOrders.bind(order_controller_1.orderController));
router.get('/:id', (0, validate_middleware_1.validate)(order_validator_1.orderIdSchema, 'params'), order_controller_1.orderController.getOrderById.bind(order_controller_1.orderController));
router.put('/:id/cancel', (0, validate_middleware_1.validate)(order_validator_1.orderIdSchema, 'params'), order_controller_1.orderController.cancelOrder.bind(order_controller_1.orderController));
exports.default = router;
