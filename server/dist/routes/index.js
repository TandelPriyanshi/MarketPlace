"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const seller_routes_1 = __importDefault(require("./seller.routes"));
const delivery_routes_1 = __importDefault(require("./delivery.routes"));
const salesman_routes_1 = __importDefault(require("./salesman.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const complaint_routes_1 = __importDefault(require("./complaint.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const router = (0, express_1.Router)();
// API version prefix
const API_PREFIX = '/api/v1';
// Register all routes
router.use(`${API_PREFIX}/auth`, auth_routes_1.default);
router.use(`${API_PREFIX}/users`, user_routes_1.default);
router.use(`${API_PREFIX}/sellers`, seller_routes_1.default);
router.use(`${API_PREFIX}/products`, product_routes_1.default);
router.use(`${API_PREFIX}/orders`, order_routes_1.default);
router.use(`${API_PREFIX}/delivery`, delivery_routes_1.default);
router.use(`${API_PREFIX}/salesmen`, salesman_routes_1.default);
router.use(`${API_PREFIX}/salesman`, salesman_routes_1.default); // Support both singular and plural
router.use(`${API_PREFIX}/customers`, customer_routes_1.default);
router.use(`${API_PREFIX}/complaints`, complaint_routes_1.default);
router.use(`${API_PREFIX}/notifications`, notification_routes_1.default);
// Root API route - returns available endpoints
router.get('/api', (req, res) => {
    res.json({
        message: 'Marketplace API',
        version: 'v1',
        endpoints: {
            auth: `${API_PREFIX}/auth`,
            users: `${API_PREFIX}/users`,
            sellers: `${API_PREFIX}/sellers`,
            products: `${API_PREFIX}/products`,
            orders: `${API_PREFIX}/orders`,
            delivery: `${API_PREFIX}/delivery`,
            salesmen: `${API_PREFIX}/salesmen`,
            customers: `${API_PREFIX}/customers`,
            complaints: `${API_PREFIX}/complaints`,
            notifications: `${API_PREFIX}/notifications`,
            docs: '/api-docs'
        }
    });
});
exports.default = router;
