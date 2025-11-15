// This is a NestJS module file - not used in Express setup
// Keeping for compatibility but not importing in Express routes
// If using NestJS, uncomment and configure properly

/*
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit } from '../models/visit.model';
import salesmanService from '../services/salesman.service';
import { SalesmanController } from '../controllers/salesman.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Salesman,
      Beat,
      Store,
      Visit,
    ]),
  ],
  controllers: [SalesmanController],
  providers: [
    {
      provide: 'SalesmanService',
      useValue: salesmanService,
    },
  ],
  exports: ['SalesmanService'],
})
export class SalesmanModule {}
*/

export {};
