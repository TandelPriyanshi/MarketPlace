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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visit = exports.VisitStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const salesman_model_1 = require("./salesman.model");
const store_model_1 = require("./store.model");
var VisitStatus;
(function (VisitStatus) {
    VisitStatus["SCHEDULED"] = "scheduled";
    VisitStatus["IN_PROGRESS"] = "in_progress";
    VisitStatus["COMPLETED"] = "completed";
    VisitStatus["CANCELLED"] = "cancelled";
})(VisitStatus || (exports.VisitStatus = VisitStatus = {}));
let Visit = class Visit extends sequelize_typescript_1.Model {
};
exports.Visit = Visit;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Visit.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => salesman_model_1.Salesman),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Visit.prototype, "salesmanId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => store_model_1.Store),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Visit.prototype, "storeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(VisitStatus)),
        defaultValue: VisitStatus.SCHEDULED,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Visit.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Visit.prototype, "scheduledAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Visit.prototype, "startedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Visit.prototype, "completedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Visit.prototype, "purpose", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Visit.prototype, "remarks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Visit.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Visit.prototype, "checkIn", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Visit.prototype, "checkOut", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => salesman_model_1.Salesman),
    __metadata("design:type", salesman_model_1.Salesman)
], Visit.prototype, "salesman", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => store_model_1.Store),
    __metadata("design:type", store_model_1.Store)
], Visit.prototype, "store", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Visit.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Visit.prototype, "updatedAt", void 0);
exports.Visit = Visit = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'visits',
        timestamps: true,
        underscored: true
    })
], Visit);
