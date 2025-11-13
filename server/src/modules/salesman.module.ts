import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit } from '../models/visit.model';
import { SalesmanService } from '../services/salesman.service';
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
  providers: [SalesmanService],
  exports: [SalesmanService],
})
export class SalesmanModule {}
