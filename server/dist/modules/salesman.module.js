"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const salesman_model_1 = require("../models/salesman.model");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const visit_model_1 = require("../models/visit.model");
const salesman_service_1 = require("../services/salesman.service");
const salesman_controller_1 = require("../controllers/salesman.controller");
let SalesmanModule = class SalesmanModule {
};
exports.SalesmanModule = SalesmanModule;
exports.SalesmanModule = SalesmanModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                salesman_model_1.Salesman,
                beat_model_1.Beat,
                store_model_1.Store,
                visit_model_1.Visit,
            ]),
        ],
        controllers: [salesman_controller_1.SalesmanController],
        providers: [salesman_service_1.SalesmanService],
        exports: [salesman_service_1.SalesmanService],
    })
], SalesmanModule);
