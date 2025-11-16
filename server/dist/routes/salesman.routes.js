"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_request_1 = require("../middleware/validate-request");
const salesman_controller_1 = require("../controllers/salesman.controller");
const router = (0, express_1.Router)();
const salesmanController = new salesman_controller_1.SalesmanController();
// Apply authentication - salesman role check can be added when UserRole.SALESMAN is added to model enum
// For now, using SALESMAN as placeholder or remove role check
router.use(auth_middleware_1.authenticate);
// Beat routes
router.post('/beats', (req, res, next) => {
    (0, validate_request_1.validateRequest)(req, res, next);
}, salesmanController.createBeat.bind(salesmanController));
router.get('/beats', salesmanController.getBeats.bind(salesmanController));
// Attendance routes
router.post('/attendance', salesmanController.markAttendance.bind(salesmanController));
// Visit routes
router.post('/visits', salesmanController.logVisit.bind(salesmanController));
router.get('/visits', salesmanController.getVisits.bind(salesmanController));
router.get('/visits/:id', salesmanController.getVisitById.bind(salesmanController));
router.put('/visits/:id/status', salesmanController.updateVisitStatus.bind(salesmanController));
// Sales Order routes
router.post('/orders', salesmanController.createSalesOrder.bind(salesmanController));
router.get('/orders', salesmanController.getOrders.bind(salesmanController));
// Performance routes
router.get('/performance', salesmanController.getSalesmanPerformance.bind(salesmanController));
exports.default = router;
