"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = exports.FILE_UPLOAD_LIMITS = exports.DEFAULT_PAGE = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.DELIVERY_STATUS_TRANSITIONS = exports.ORDER_STATUS_TRANSITIONS = exports.BEAT_STATUSES = exports.VISIT_STATUSES = exports.DELIVERY_PERSON_STATUSES = exports.SELLER_STATUSES = exports.COMPLAINT_TYPES = exports.COMPLAINT_STATUSES = exports.PRODUCT_STATUSES = exports.DELIVERY_STATUSES = exports.PAYMENT_STATUSES = exports.ORDER_STATUSES = void 0;
const order_model_1 = require("../models/order.model");
const product_model_1 = require("../models/product.model");
const complaint_model_1 = require("../models/complaint.model");
const seller_model_1 = require("../models/seller.model");
const deliveryPerson_model_1 = require("../models/deliveryPerson.model");
const visit_model_1 = require("../models/visit.model");
const beat_model_1 = require("../models/beat.model");
exports.ORDER_STATUSES = Object.values(order_model_1.OrderStatus);
exports.PAYMENT_STATUSES = Object.values(order_model_1.PaymentStatus);
exports.DELIVERY_STATUSES = Object.values(order_model_1.DeliveryStatus);
exports.PRODUCT_STATUSES = Object.values(product_model_1.ProductStatus);
exports.COMPLAINT_STATUSES = Object.values(complaint_model_1.ComplaintStatus);
exports.COMPLAINT_TYPES = Object.values(complaint_model_1.ComplaintType);
exports.SELLER_STATUSES = Object.values(seller_model_1.SellerStatus);
exports.DELIVERY_PERSON_STATUSES = Object.values(deliveryPerson_model_1.DeliveryPersonStatus);
exports.VISIT_STATUSES = Object.values(visit_model_1.VisitStatus);
exports.BEAT_STATUSES = Object.values(beat_model_1.BeatStatus);
exports.ORDER_STATUS_TRANSITIONS = {
    [order_model_1.OrderStatus.PENDING]: [order_model_1.OrderStatus.CONFIRMED, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.PROCESSING]: [order_model_1.OrderStatus.SHIPPED, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.SHIPPED]: [order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.DELIVERED]: [order_model_1.OrderStatus.COMPLETED],
    [order_model_1.OrderStatus.COMPLETED]: [],
    [order_model_1.OrderStatus.CANCELLED]: [],
    [order_model_1.OrderStatus.REFUNDED]: [],
    [order_model_1.OrderStatus.RETURN_REQUESTED]: [order_model_1.OrderStatus.RETURN_APPROVED, order_model_1.OrderStatus.RETURN_REJECTED],
    [order_model_1.OrderStatus.RETURN_APPROVED]: [order_model_1.OrderStatus.RETURN_COMPLETED],
    [order_model_1.OrderStatus.RETURN_REJECTED]: [],
    [order_model_1.OrderStatus.RETURN_COMPLETED]: [],
};
exports.DELIVERY_STATUS_TRANSITIONS = {
    [order_model_1.DeliveryStatus.PENDING]: [order_model_1.DeliveryStatus.ASSIGNED, order_model_1.DeliveryStatus.CANCELLED],
    [order_model_1.DeliveryStatus.ASSIGNED]: [order_model_1.DeliveryStatus.PICKED_UP, order_model_1.DeliveryStatus.CANCELLED],
    [order_model_1.DeliveryStatus.PICKED_UP]: [order_model_1.DeliveryStatus.OUT_FOR_DELIVERY, order_model_1.DeliveryStatus.RETURNED],
    [order_model_1.DeliveryStatus.OUT_FOR_DELIVERY]: [order_model_1.DeliveryStatus.DELIVERED, order_model_1.DeliveryStatus.RETURNED],
    [order_model_1.DeliveryStatus.DELIVERED]: [],
    [order_model_1.DeliveryStatus.RETURNED]: [],
    [order_model_1.DeliveryStatus.CANCELLED]: [],
};
exports.DEFAULT_PAGE_SIZE = 10;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_PAGE = 1;
exports.FILE_UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_PATH: './uploads',
};
exports.JWT_CONFIG = {
    EXPIRES_IN: '7d',
    REFRESH_EXPIRES_IN: '30d',
};
