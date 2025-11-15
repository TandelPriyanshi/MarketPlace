"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const salesman_model_1 = require("../models/salesman.model");
const beat_model_1 = require("../models/beat.model");
const visit_model_1 = require("../models/visit.model");
const store_model_1 = require("../models/store.model");
class SalesmanRepository {
    constructor() { }
    static getInstance() {
        if (!SalesmanRepository.instance) {
            SalesmanRepository.instance = new SalesmanRepository();
        }
        return SalesmanRepository.instance;
    }
    async create(salesmanData) {
        const salesman = new salesman_model_1.Salesman();
        Object.assign(salesman, {
            ...salesmanData,
            isActive: true,
            lastActiveAt: null
        });
        return await salesman.save();
    }
    async findById(id, includeRelations = false) {
        const options = { where: { id } };
        if (includeRelations) {
            options.include = [
                { model: beat_model_1.Beat, as: 'beats' },
                {
                    model: visit_model_1.Visit,
                    as: 'visits',
                    include: [store_model_1.Store],
                    limit: 10,
                    order: [['scheduledAt', 'DESC']]
                }
            ];
        }
        return await salesman_model_1.Salesman.findByPk(id, options);
    }
    async findByEmail(email) {
        return await salesman_model_1.Salesman.findOne({ where: { email } });
    }
    async findAll(limit = 10, offset = 0, filter) {
        const where = filter ? { ...filter } : {};
        return await salesman_model_1.Salesman.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    async update(id, salesmanData) {
        return await salesman_model_1.Salesman.update(salesmanData, {
            where: { id },
            returning: true
        });
    }
    async delete(id) {
        return await salesman_model_1.Salesman.destroy({
            where: { id }
        });
    }
    async updateLastActive(salesmanId) {
        await salesman_model_1.Salesman.update({ lastActiveAt: new Date() }, { where: { id: salesmanId } });
    }
    async getSalesmanStats(salesmanId) {
        const [totalBeats, activeBeats, totalVisits, visitsThisMonth, storesCovered] = await Promise.all([
            beat_model_1.Beat.count({ where: { salesmanId } }),
            beat_model_1.Beat.count({
                where: {
                    salesmanId,
                    status: 'active'
                }
            }),
            visit_model_1.Visit.count({ where: { salesmanId } }),
            visit_model_1.Visit.count({
                where: {
                    salesmanId,
                    createdAt: {
                        [sequelize_1.Op.gte]: new Date(new Date().setDate(1)), // First day of current month
                        [sequelize_1.Op.lte]: new Date() // Now
                    }
                }
            }),
            store_model_1.Store.count({
                where: {
                    '$beats.salesmanId$': salesmanId
                },
                include: [
                    {
                        model: beat_model_1.Beat,
                        as: 'beats',
                        required: true
                    }
                ],
                distinct: true
            })
        ]);
        return { totalBeats, activeBeats, totalVisits, visitsThisMonth, storesCovered };
    }
    async getActiveSalesmen() {
        return await salesman_model_1.Salesman.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });
    }
}
exports.default = SalesmanRepository.getInstance();
