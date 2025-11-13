"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = exports.CustomerController = void 0;
const customer_service_1 = require("../services/customer.service");
const logger_1 = require("../utils/logger");
const express_validator_1 = require("express-validator");
class CustomerController {
    // Get all sellers with optional filters
    async getSellers(req, res) {
        try {
            const { city, area, pincode } = req.query;
            const sellers = await customer_service_1.customerService.getSellers({
                city: city,
                area: area,
                pincode: pincode,
            });
            res.json(sellers);
        }
        catch (error) {
            logger_1.logger.error('Error in getSellers controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch sellers'
            });
        }
    }
    // Place a new order
    async placeOrder(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        try {
            const userId = req.user.id; // From auth middleware
            const order = await customer_service_1.customerService.placeOrder(userId, req.body);
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order placed successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in placeOrder controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to place order'
            });
        }
    }
    // Get order details by ID
    async getOrderDetails(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const order = await customer_service_1.customerService.getOrderDetails(userId, id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            res.json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getOrderDetails controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch order details'
            });
        }
    }
    // Create a new complaint
    async createComplaint(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        try {
            const userId = req.user.id;
            const files = req.files;
            const complaint = await customer_service_1.customerService.createComplaint(userId, req.body, files);
            res.status(201).json({
                success: true,
                data: complaint,
                message: 'Complaint submitted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createComplaint controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to submit complaint'
            });
        }
    }
    // Get all complaints for the current user
    async getComplaints(req, res) {
        try {
            const userId = req.user.id;
            const { status } = req.query;
            const complaints = await customer_service_1.customerService.getUserComplaints(userId, {
                status: status,
            });
            res.json({
                success: true,
                data: complaints,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getComplaints controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch complaints'
            });
        }
    }
}
exports.CustomerController = CustomerController;
exports.customerController = new CustomerController();
