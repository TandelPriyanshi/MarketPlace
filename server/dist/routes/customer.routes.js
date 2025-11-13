"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = void 0;
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const customer_validations_1 = require("../validations/customer.validations");
const validate_request_1 = require("../middleware/validate-request");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const user_model_1 = require("../models/user.model");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
exports.customerRoutes = router;
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/complaints/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image, PDF and document files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// Apply authentication middleware to all customer routes
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)([user_model_1.UserRole.BUYER]));
// Seller routes
router.get('/sellers', customer_validations_1.getSellersValidation, validate_request_1.validateRequest, customer_controller_1.customerController.getSellers);
// Order routes
router.post('/orders', customer_validations_1.placeOrderValidation, validate_request_1.validateRequest, customer_controller_1.customerController.placeOrder);
router.get('/orders/:id', customer_validations_1.getOrderDetailsValidation, validate_request_1.validateRequest, customer_controller_1.customerController.getOrderDetails);
// Complaint routes
router.post('/complaints', upload.array('attachments', 5), // Max 5 files
customer_validations_1.createComplaintValidation, validate_request_1.validateRequest, customer_controller_1.customerController.createComplaint);
router.get('/complaints', customer_validations_1.getComplaintsValidation, validate_request_1.validateRequest, customer_controller_1.customerController.getComplaints);
