import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(WebhookLog.name) private logModel: Model<WebhookLogDocument>,
    @InjectModel(OrderStatus.name) private statusModel: Model<OrderStatusDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async handle(payload: any) {
    await this.logModel.create({ payload });

    const collect_id =
      payload.collect_id || payload.collectId || (payload.data && payload.data.collect_id) || (payload.data && payload.data.collectId);

    const status =
      payload.status || (payload.data && payload.data.status) || payload.payment_status || 'unknown';

    const order_amount =
      (payload.order_amount !== undefined ? payload.order_amount :
       (payload.data && payload.data.order_amount) !== undefined ? payload.data.order_amount :
       (payload.amount !== undefined ? payload.amount : 0));

    const transaction_amount =
      (payload.transaction_amount !== undefined ? payload.transaction_amount :
       (payload.data && payload.data.transaction_amount) !== undefined ? payload.data.transaction_amount :
       (payload.paid_amount !== undefined ? payload.paid_amount : 0));

    const custom_order_id =
      payload.custom_order_id || (payload.data && payload.data.custom_order_id) || (payload.meta && payload.meta.custom_order_id);

    const pt = payload.payment_time || (payload.data && payload.data.payment_time);
    const payment_time = pt ? new Date(pt) : undefined;

    if (collect_id) {
      await this.statusModel.updateOne(
        { collect_id },
        {
          $set: {
            status,
            order_amount,
            transaction_amount,
            custom_order_id,
            payment_time,
          },
        },
        { upsert: true },
      );
    }

    if (custom_order_id && collect_id) {
      await this.orderModel.updateOne(
        { custom_order_id },
        { $set: { collect_request_id: collect_id } },
      );
    }

    return { ok: true };
  }
}
