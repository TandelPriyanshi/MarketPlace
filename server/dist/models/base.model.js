"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
class BaseModel extends sequelize_typescript_1.Model {
    static associate(models) {
        // Can be overridden by subclasses
    }
}
exports.BaseModel = BaseModel;
