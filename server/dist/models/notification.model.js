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
exports.Notification = exports.NotificationType = void 0;
exports.setupNotificationAssociations = setupNotificationAssociations;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const user_model_1 = require("./user.model");
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_PLACED"] = "order_placed";
    NotificationType["ORDER_CONFIRMED"] = "order_confirmed";
    NotificationType["ORDER_SHIPPED"] = "order_shipped";
    NotificationType["ORDER_DELIVERED"] = "order_delivered";
    NotificationType["ORDER_CANCELLED"] = "order_cancelled";
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["COMPLAINT_CREATED"] = "complaint_created";
    NotificationType["COMPLAINT_RESOLVED"] = "complaint_resolved";
    NotificationType["PRODUCT_LOW_STOCK"] = "product_low_stock";
    NotificationType["DELIVERY_ASSIGNED"] = "delivery_assigned";
    NotificationType["DELIVERY_COMPLETED"] = "delivery_completed";
    NotificationType["SYSTEM_UPDATE"] = "system_update";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification extends sequelize_typescript_1.Model {
};
exports.Notification = Notification;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.ENUM(...Object.values(NotificationType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    }),
    __metadata("design:type", Object)
], Notification.prototype, "data", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'isRead'
    }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
    }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, 'userId'),
    __metadata("design:type", user_model_1.User)
], Notification.prototype, "user", void 0);
exports.Notification = Notification = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'notifications',
        timestamps: true,
        underscored: true
    })
], Notification);
// Setup associations
function setupNotificationAssociations() {
    Notification.belongsTo(user_model_1.User, {
        foreignKey: 'userId',
        as: 'user'
    });
}
