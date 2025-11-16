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
var Seller_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seller = exports.SellerStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_model_1 = require("./base.model");
const user_model_1 = require("./user.model");
const product_model_1 = require("./product.model");
const order_model_1 = require("./order.model");
var SellerStatus;
(function (SellerStatus) {
    SellerStatus["PENDING"] = "pending";
    SellerStatus["ACTIVE"] = "active";
    SellerStatus["SUSPENDED"] = "suspended";
    SellerStatus["REJECTED"] = "rejected";
})(SellerStatus || (exports.SellerStatus = SellerStatus = {}));
let Seller = Seller_1 = class Seller extends base_model_1.BaseModel {
    static associate(models) {
        Seller_1.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        Seller_1.hasMany(models.Product, {
            foreignKey: 'sellerId',
            as: 'products',
        });
        Seller_1.hasMany(models.Order, {
            foreignKey: 'sellerId',
            as: 'orders',
        });
    }
};
exports.Seller = Seller;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Seller.prototype, "businessName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "businessDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "businessAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "businessPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "businessEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Seller.prototype, "taxId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(SellerStatus)),
        defaultValue: SellerStatus.PENDING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Seller.prototype, "status", void 0);
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
], Seller.prototype, "rating", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    }),
    __metadata("design:type", Number)
], Seller.prototype, "totalSales", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        allowNull: true,
        defaultValue: {},
    }),
    __metadata("design:type", Object)
], Seller.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, 'userId'),
    __metadata("design:type", user_model_1.User)
], Seller.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => product_model_1.Product, 'sellerId'),
    __metadata("design:type", Array)
], Seller.prototype, "products", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => order_model_1.Order),
    __metadata("design:type", Array)
], Seller.prototype, "orders", void 0);
exports.Seller = Seller = Seller_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'sellers',
        timestamps: true,
        paranoid: true,
        modelName: 'Seller'
    })
], Seller);
