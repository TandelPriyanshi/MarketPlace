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
exports.Order = exports.OrderStatus = exports.PaymentStatus = exports.DeliveryStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const orderItem_model_1 = require("./orderItem.model");
const user_model_1 = require("./user.model");
const seller_model_1 = require("./seller.model");
const deliveryPerson_model_1 = require("./deliveryPerson.model");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "pending";
    DeliveryStatus["ASSIGNED"] = "assigned";
    DeliveryStatus["PICKED_UP"] = "picked_up";
    DeliveryStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["RETURNED"] = "returned";
    DeliveryStatus["CANCELLED"] = "cancelled";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["REFUNDED"] = "refunded";
    OrderStatus["RETURN_REQUESTED"] = "return_requested";
    OrderStatus["RETURN_APPROVED"] = "return_approved";
    OrderStatus["RETURN_REJECTED"] = "return_rejected";
    OrderStatus["RETURN_COMPLETED"] = "return_completed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order extends sequelize_typescript_1.Model {
};
exports.Order = Order;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DeliveryStatus)),
        defaultValue: DeliveryStatus.PENDING,
        allowNull: false,
        validate: {
            isIn: [Object.values(DeliveryStatus)]
        }
    }),
    __metadata("design:type", String)
], Order.prototype, "deliveryStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(PaymentStatus)),
        defaultValue: PaymentStatus.PENDING,
        allowNull: false,
        validate: {
            isIn: [Object.values(PaymentStatus)]
        }
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(OrderStatus)),
        defaultValue: OrderStatus.PENDING,
        allowNull: false,
        validate: {
            isIn: [Object.values(OrderStatus)]
        }
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], Order.prototype, "isCancelled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "shippingAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "billingAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        allowNull: true,
        defaultValue: null,
        validate: {
            isValidMetadata(value) {
                if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
                    throw new Error('Metadata must be an object');
                }
            }
        }
    }),
    __metadata("design:type", Object)
], Order.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => seller_model_1.Seller),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "sellerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Order.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => seller_model_1.Seller),
    __metadata("design:type", seller_model_1.Seller)
], Order.prototype, "seller", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => deliveryPerson_model_1.DeliveryPerson),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "deliveryPersonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => deliveryPerson_model_1.DeliveryPerson),
    __metadata("design:type", deliveryPerson_model_1.DeliveryPerson)
], Order.prototype, "deliveryPerson", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => orderItem_model_1.OrderItem),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'orders',
        timestamps: true
    })
], Order);
