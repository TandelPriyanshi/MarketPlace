"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
// Apply authentication and seller role check to all routes
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(user_model_1.UserRole.SELLER));
// Seller dashboard
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Seller dashboard' });
});
// Add more seller-specific routes here
exports.default = router;
