"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
var error_middleware_1 = require("./error.middleware");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return error_middleware_1.errorHandler; } });
Object.defineProperty(exports, "notFoundHandler", { enumerable: true, get: function () { return error_middleware_1.notFoundHandler; } });
