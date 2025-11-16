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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const Joi = __importStar(require("joi"));
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
// Validation schemas
const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});
const orderStatusSchema = Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'RETURN_COMPLETED', 'COMPLETED').required()
});
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Order routes
router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/customer', orderController.getCustomerOrders.bind(orderController));
router.get('/customer/orders', orderController.getCustomerOrders.bind(orderController));
router.get('/seller/orders', orderController.getSellerOrders.bind(orderController));
router.get('/:id', (0, validate_middleware_1.validate)(orderIdSchema, 'params'), orderController.getOrderById.bind(orderController));
router.post('/', orderController.placeOrder.bind(orderController));
router.put('/:id/status', (0, validate_middleware_1.validate)(orderIdSchema, 'params'), orderController.updateOrderStatus.bind(orderController));
router.put('/:id/cancel', (0, validate_middleware_1.validate)(orderIdSchema, 'params'), orderController.cancelOrder.bind(orderController));
exports.default = router;
