"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const logger_1 = require("../utils/logger");
class AuthController {
    async register(req, res) {
        try {
            // Validate request
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, password, name, phone, role } = req.body;
            // Register user
            const result = await auth_service_1.default.registerUser(email, password, name, phone, role);
            return res.status(201).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }
    async login(req, res) {
        try {
            // Validate request
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, password } = req.body;
            // Login user
            const result = await auth_service_1.default.loginUser(email, password);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message || 'Invalid credentials'
            });
        }
    }
    async getCurrentUser(req, res) {
        try {
            // User is already attached to request by auth middleware
            const user = req.user;
            return res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            logger_1.logger.error('Get current user error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get current user'
            });
        }
    }
}
exports.default = new AuthController();
