"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// In src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const seller_routes_1 = __importDefault(require("./routes/seller.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const swagger_1 = require("./config/swagger");
const db_1 = require("./db");
const config_1 = require("./config/config");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Serve uploaded files
app.use('/uploads', express_1.default.static('uploads'));
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/seller', seller_routes_1.default);
app.use('/api/v1/delivery', delivery_routes_1.default);
// Swagger Documentation
if (config_1.config.isDevelopment) {
    (0, swagger_1.setupSwagger)(app);
}
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Database connection
(0, db_1.connectDB)();
exports.default = app;
