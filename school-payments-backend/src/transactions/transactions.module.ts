import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { TransactionsService } from './transactions.service';
import { TransactionsController, TransactionStatusController } from './transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
    ]),
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController, TransactionStatusController],
})
export class TransactionsModule {}
