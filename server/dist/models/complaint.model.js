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
exports.Complaint = exports.ComplaintType = exports.ComplaintStatus = void 0;
exports.setupComplaintAssociations = setupComplaintAssociations;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("./user.model");
const order_model_1 = require("./order.model");
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["OPEN"] = "open";
    ComplaintStatus["IN_PROGRESS"] = "in_progress";
    ComplaintStatus["RESOLVED"] = "resolved";
    ComplaintStatus["REJECTED"] = "rejected";
    ComplaintStatus["CLOSED"] = "closed";
    ComplaintStatus["REOPENED"] = "reopened";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
var ComplaintType;
(function (ComplaintType) {
    ComplaintType["ORDER_ISSUE"] = "order_issue";
    ComplaintType["DELIVERY_ISSUE"] = "delivery_issue";
    ComplaintType["PRODUCT_QUALITY"] = "product_quality";
    ComplaintType["SELLER_BEHAVIOR"] = "seller_behavior";
    ComplaintType["PAYMENT_ISSUE"] = "payment_issue";
    ComplaintType["OTHER"] = "other";
})(ComplaintType || (exports.ComplaintType = ComplaintType = {}));
let Complaint = class Complaint extends sequelize_typescript_1.Model {
};
exports.Complaint = Complaint;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_model_1.Order),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true, // Can be null if complaint is not related to an order
    }),
    __metadata("design:type", String)
], Complaint.prototype, "orderId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(ComplaintType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(ComplaintStatus)),
        defaultValue: ComplaintStatus.OPEN,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        allowNull: true,
        defaultValue: [],
    }),
    __metadata("design:type", Array)
], Complaint.prototype, "attachments", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "resolutionNotes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true, // Admin/Seller who resolved the complaint
    }),
    __metadata("design:type", String)
], Complaint.prototype, "resolvedById", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], Complaint.prototype, "resolvedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, 'userId'),
    __metadata("design:type", user_model_1.User)
], Complaint.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_model_1.Order, 'orderId'),
    __metadata("design:type", order_model_1.Order)
], Complaint.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, 'resolvedById'),
    __metadata("design:type", user_model_1.User)
], Complaint.prototype, "resolvedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Complaint.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Complaint.prototype, "updatedAt", void 0);
exports.Complaint = Complaint = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'complaints',
        timestamps: true,
        underscored: true
    })
], Complaint);
// Add associations
function setupComplaintAssociations() {
    Complaint.belongsTo(user_model_1.User, { foreignKey: 'userId' });
    Complaint.belongsTo(order_model_1.Order, { foreignKey: 'orderId' });
    Complaint.belongsTo(user_model_1.User, { as: 'resolvedBy', foreignKey: 'resolvedById' });
}
