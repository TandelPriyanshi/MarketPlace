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
exports.Beat = exports.BeatStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const salesman_model_1 = require("./salesman.model");
const store_model_1 = require("./store.model");
var BeatStatus;
(function (BeatStatus) {
    BeatStatus["ACTIVE"] = "active";
    BeatStatus["INACTIVE"] = "inactive";
    BeatStatus["COMPLETED"] = "completed";
})(BeatStatus || (exports.BeatStatus = BeatStatus = {}));
let Beat = class Beat extends sequelize_typescript_1.Model {
};
exports.Beat = Beat;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Beat.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Beat.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Beat.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => salesman_model_1.Salesman),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'salesman_id'
    }),
    __metadata("design:type", String)
], Beat.prototype, "salesmanId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Beat.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Beat.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(BeatStatus)),
        defaultValue: BeatStatus.ACTIVE,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Beat.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Beat.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => salesman_model_1.Salesman),
    __metadata("design:type", salesman_model_1.Salesman)
], Beat.prototype, "salesman", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => store_model_1.Store),
    __metadata("design:type", Array)
], Beat.prototype, "stores", void 0);
exports.Beat = Beat = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'beats',
        timestamps: true,
        underscored: true
    })
], Beat);
