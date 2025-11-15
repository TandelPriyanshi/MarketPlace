"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const salesman_controller_1 = require("../controllers/salesman.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const salesman_validator_1 = require("../validators/salesman.validator");
const router = (0, express_1.Router)();
// Apply authentication - salesman role check can be added when UserRole.SALESMAN is added to model enum
// For now, using SALESMAN as placeholder or remove role check
router.use(auth_middleware_1.authenticate);
// Beat routes
router.post('/beats', (0, validate_middleware_1.validate)(salesman_validator_1.createBeatSchema), salesman_controller_1.salesmanController.createBeat.bind(salesman_controller_1.salesmanController));
router.get('/beats', salesman_controller_1.salesmanController.getBeats.bind(salesman_controller_1.salesmanController));
router.get('/beats/:id', (0, validate_middleware_1.validate)(salesman_validator_1.beatIdSchema, 'params'), salesman_controller_1.salesmanController.getBeatById.bind(salesman_controller_1.salesmanController));
// Visit routes
router.post('/visits', (0, validate_middleware_1.validate)(salesman_validator_1.createVisitSchema), salesman_controller_1.salesmanController.createVisit.bind(salesman_controller_1.salesmanController));
router.get('/visits', salesman_controller_1.salesmanController.getVisits.bind(salesman_controller_1.salesmanController));
router.get('/visits/:id', (0, validate_middleware_1.validate)(salesman_validator_1.visitIdSchema, 'params'), salesman_controller_1.salesmanController.getVisitById.bind(salesman_controller_1.salesmanController));
router.put('/visits/:id/status', (0, validate_middleware_1.validate)(salesman_validator_1.updateVisitStatusSchema), (0, validate_middleware_1.validate)(salesman_validator_1.visitIdSchema, 'params'), salesman_controller_1.salesmanController.updateVisitStatus.bind(salesman_controller_1.salesmanController));
exports.default = router;
