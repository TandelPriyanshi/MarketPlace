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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const { JWT_SECRET, JWT_EXPIRES_IN } = env_1.env;
class AuthService {
    async registerUser(email, password, name, phone, role = user_model_1.UserRole.BUYER) {
        try {
            // Check if user already exists
            const existingUser = await user_model_1.User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
            // Hash password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create user
            const user = await user_model_1.User.create({
                email,
                passwordHash: hashedPassword,
                name,
                phone,
                role,
                isActive: true
            });
            // Generate JWT token
            const token = this.generateToken(user);
            return {
                user: this.getUserWithoutPassword(user),
                token
            };
        }
        catch (error) {
            logger_1.logger.error('Error in registerUser:', error);
            throw error;
        }
    }
    async loginUser(email, password) {
        try {
            // Find user by email
            const user = await user_model_1.User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Check if user is active
            if (!user.isActive) {
                throw new Error('Account is deactivated. Please contact support.');
            }
            // Check password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            // Generate JWT token
            const token = this.generateToken(user);
            return {
                user: this.getUserWithoutPassword(user),
                token
            };
        }
        catch (error) {
            logger_1.logger.error('Error in loginUser:', error);
            throw error;
        }
    }
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
    }
    getUserWithoutPassword(user) {
        const userJson = user.toJSON();
        delete userJson.passwordHash;
        return userJson;
    }
    async validateToken(token) {
        try {
            // First, verify the token and get the payload
            const payload = jwt.verify(token, JWT_SECRET);
            // Check if the payload has the expected shape
            if (typeof payload === 'string' || !('id' in payload)) {
                throw new Error('Invalid token payload');
            }
            const userId = payload.id;
            if (!userId) {
                throw new Error('User ID not found in token');
            }
            const user = await user_model_1.User.findByPk(userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error validating token:', error);
            throw new Error('Invalid or expired token');
        }
    }
}
// Export a singleton instance
exports.authService = new AuthService();
exports.default = exports.authService;
