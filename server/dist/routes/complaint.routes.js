"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const complaint_controller_1 = require("../controllers/complaint.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const customer_validator_1 = require("../validators/customer.validator");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Complaint routes
router.post('/', upload_middleware_1.upload.array('attachments', 5), (0, validate_middleware_1.validate)(customer_validator_1.createComplaintSchema), complaint_controller_1.complaintController.createComplaint.bind(complaint_controller_1.complaintController));
router.get('/', complaint_controller_1.complaintController.getComplaints.bind(complaint_controller_1.complaintController));
router.get('/:id', (0, validate_middleware_1.validate)(customer_validator_1.complaintIdSchema, 'params'), complaint_controller_1.complaintController.getComplaintById.bind(complaint_controller_1.complaintController));
router.put('/:id/status', (0, validate_middleware_1.validate)(customer_validator_1.complaintIdSchema, 'params'), complaint_controller_1.complaintController.updateComplaintStatus.bind(complaint_controller_1.complaintController));
exports.default = router;
