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
var DeliveryPerson_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPerson = exports.DeliveryPersonStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_model_1 = require("./base.model");
const user_model_1 = require("./user.model");
const order_model_1 = require("./order.model");
var DeliveryPersonStatus;
(function (DeliveryPersonStatus) {
    DeliveryPersonStatus["ACTIVE"] = "active";
    DeliveryPersonStatus["INACTIVE"] = "inactive";
    DeliveryPersonStatus["ON_LEAVE"] = "on_leave";
    DeliveryPersonStatus["SUSPENDED"] = "suspended";
})(DeliveryPersonStatus || (exports.DeliveryPersonStatus = DeliveryPersonStatus = {}));
let DeliveryPerson = DeliveryPerson_1 = class DeliveryPerson extends base_model_1.BaseModel {
    static associate(models) {
        DeliveryPerson_1.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        DeliveryPerson_1.hasMany(models.Order, {
            foreignKey: 'deliveryPersonId',
            as: 'orders',
        });
    }
};
exports.DeliveryPerson = DeliveryPerson;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "vehicleType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "vehicleNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "licenseNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DeliveryPersonStatus)),
        defaultValue: DeliveryPersonStatus.ACTIVE,
        allowNull: false,
    }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5,
        },
    }),
    __metadata("design:type", Number)
], DeliveryPerson.prototype, "rating", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    }),
    __metadata("design:type", Number)
], DeliveryPerson.prototype, "totalDeliveries", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0,
        },
    }),
    __metadata("design:type", Number)
], DeliveryPerson.prototype, "totalEarnings", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        allowNull: true,
        defaultValue: {},
    }),
    __metadata("design:type", Object)
], DeliveryPerson.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], DeliveryPerson.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => order_model_1.Order),
    __metadata("design:type", Array)
], DeliveryPerson.prototype, "orders", void 0);
exports.DeliveryPerson = DeliveryPerson = DeliveryPerson_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'delivery_persons',
        timestamps: true,
        underscored: true,
        paranoid: true,
        modelName: 'DeliveryPerson'
    })
], DeliveryPerson);
