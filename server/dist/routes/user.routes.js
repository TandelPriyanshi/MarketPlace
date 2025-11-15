"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const user_model_1 = require("../models/user.model");
const user_controller_1 = require("../controllers/user.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Admin only routes
router.use((0, role_middleware_1.requireRole)(user_model_1.UserRole.ADMIN));
const userIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid user ID format',
        'any.required': 'User ID is required',
    }),
});
// User routes
router.get('/', user_controller_1.userController.getAllUsers.bind(user_controller_1.userController));
router.get('/:id', (0, validate_middleware_1.validate)(userIdSchema, 'params'), user_controller_1.userController.getUserById.bind(user_controller_1.userController));
router.put('/:id', (0, validate_middleware_1.validate)(userIdSchema, 'params'), user_controller_1.userController.updateUser.bind(user_controller_1.userController));
router.put('/:id/deactivate', (0, validate_middleware_1.validate)(userIdSchema, 'params'), user_controller_1.userController.deactivateUser.bind(user_controller_1.userController));
router.put('/:id/activate', (0, validate_middleware_1.validate)(userIdSchema, 'params'), user_controller_1.userController.activateUser.bind(user_controller_1.userController));
exports.default = router;
