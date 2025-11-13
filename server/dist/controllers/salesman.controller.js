"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const salesman_service_1 = require("../services/salesman.service");
const salesman_dto_1 = require("../dto/salesman.dto");
let SalesmanController = class SalesmanController {
    constructor(salesmanService) {
        this.salesmanService = salesmanService;
    }
    async getBeats(req) {
        return this.salesmanService.getSalesmanBeats(req.user.id);
    }
    async createBeat(req, createBeatDto) {
        return this.salesmanService.createBeat(req.user.id, createBeatDto);
    }
    async logVisit(req, createVisitDto) {
        return this.salesmanService.logVisit(req.user.id, createVisitDto);
    }
    async updateVisit(req, visitId, updateVisitDto) {
        return this.salesmanService.updateVisit(visitId, req.user.id, updateVisitDto);
    }
    async recordAttendance(req, attendanceData) {
        return this.salesmanService.recordAttendance(req.user.id, attendanceData);
    }
    async getPerformance(req, query) {
        return this.salesmanService.getPerformanceMetrics(req.user.id, query);
    }
};
exports.SalesmanController = SalesmanController;
__decorate([
    (0, common_1.Get)('beats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all beats for the logged-in salesman' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all beats for the salesman' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "getBeats", null);
__decorate([
    (0, common_1.Post)('beats'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new beat' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Creates a new beat' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, salesman_dto_1.CreateBeatDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "createBeat", null);
__decorate([
    (0, common_1.Post)('visits'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a new store visit' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Logs a new store visit' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, salesman_dto_1.CreateVisitDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "logVisit", null);
__decorate([
    (0, common_1.Put)('visits/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a visit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updates a visit' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, salesman_dto_1.UpdateVisitDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "updateVisit", null);
__decorate([
    (0, common_1.Post)('attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Record salesman attendance' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Records salesman attendance' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, salesman_dto_1.RecordAttendanceDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "recordAttendance", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get salesman performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns performance metrics' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, salesman_dto_1.PerformanceQueryDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "getPerformance", null);
exports.SalesmanController = SalesmanController = __decorate([
    (0, swagger_1.ApiTags)('salesman'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('salesman'),
    __metadata("design:paramtypes", [salesman_service_1.SalesmanService])
], SalesmanController);
