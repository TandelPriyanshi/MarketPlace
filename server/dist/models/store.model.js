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
exports.Store = exports.StoreType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const beat_model_1 = require("./beat.model");
var StoreType;
(function (StoreType) {
    StoreType["RETAIL"] = "retail";
    StoreType["WHOLESALE"] = "wholesale";
    StoreType["DISTRIBUTOR"] = "distributor";
})(StoreType || (exports.StoreType = StoreType = {}));
let Store = class Store extends sequelize_typescript_1.Model {
};
exports.Store = Store;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Store.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Store.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Store.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Store.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Store.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        field: 'contact_person'
    }),
    __metadata("design:type", String)
], Store.prototype, "contactPerson", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 8),
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Store.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(11, 8),
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Store.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(StoreType)),
        defaultValue: StoreType.RETAIL,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Store.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => beat_model_1.Beat),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'beat_id'
    }),
    __metadata("design:type", String)
], Store.prototype, "beatId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => beat_model_1.Beat),
    __metadata("design:type", beat_model_1.Beat)
], Store.prototype, "beat", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'last_visited_at'
    }),
    __metadata("design:type", Date)
], Store.prototype, "lastVisitedAt", void 0);
exports.Store = Store = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'stores',
        timestamps: false,
        underscored: true
    })
], Store);
