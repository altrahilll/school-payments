// // import { Injectable, NotFoundException } from '@nestjs/common';
// // import { InjectModel } from '@nestjs/mongoose';
// // import { Model } from 'mongoose';
// // import { Order, OrderDocument } from '../schemas/order.schema';
// // import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

// // @Injectable()
// // export class TransactionsService {
// //   constructor(
// //     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
// //     @InjectModel(OrderStatus.name) private statusModel: Model<OrderStatusDocument>,
// //   ) {}

// //   async findAllStatuses() {
// //     return this.statusModel.find().sort({ createdAt: -1 }).lean();
// //   }

// //   async findOrdersBySchool(schoolId: string) {
// //     return this.orderModel.find({ school_id: schoolId }).sort({ createdAt: -1 }).lean();
// //   }

// //   async findStatusByCustomOrderId(custom_order_id: string) {
// //     // Normalize to avoid hidden whitespace/encoding issues
// //     const coid = decodeURIComponent(custom_order_id).trim();

// //     // 1) If a status row was written with custom_order_id directly, return it
// //     const statusByCoid = await this.statusModel.findOne({ custom_order_id: coid }).lean();
// //     if (statusByCoid) return statusByCoid;

// //     // 2) Find the Order by our custom_order_id
// //     const order = await this.orderModel.findOne({ custom_order_id: coid }).lean();
// //     if (!order) throw new NotFoundException('Order not found');

// //     // 3) Primary: our OrderStatus.collect_id stores Order._id
// //     const byOrderId = await this.statusModel.findOne({ collect_id: order._id }).lean();
// //     if (byOrderId) return byOrderId;

// //     // 4) Backward-compat: if some rows used external collect_request_id, try that too
// //     if (order.collect_request_id) {
// //       const legacy = await this.statusModel.findOne({ collect_id: order.collect_request_id }).lean();
// //       if (legacy) return legacy;
// //     }

// //     throw new NotFoundException('Status not found');
// //   }
// // }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Order, OrderDocument } from '../schemas/order.schema';
// import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

// @Injectable()
// export class TransactionsService {
//   constructor(
//     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
//     @InjectModel(OrderStatus.name) private statusModel: Model<OrderStatusDocument>,
//   ) {}

//   async findAllStatuses() {
//     return this.statusModel.find().sort({ createdAt: -1 }).lean();
//   }

//   async findOrdersBySchool(schoolId: string) {
//     return this.orderModel.find({ school_id: schoolId }).sort({ createdAt: -1 }).lean();
//   }

//   async findStatusByCustomOrderId(custom_order_id: string) {
//     const coid = decodeURIComponent(custom_order_id).trim();

//     // 1) If a status row was written directly with custom_order_id, return it
//     const statusByCoid = await this.statusModel.findOne({ custom_order_id: coid }).lean();
//     if (statusByCoid) return statusByCoid;

//     // 2) Find the Order by our custom_order_id
//     const order = await this.orderModel.findOne({ custom_order_id: coid }).lean();
//     if (!order) throw new NotFoundException('Order not found');

//     // 3) Primary: OrderStatus.collect_id stores Order._id
//     const byOrderId = await this.statusModel.findOne({ collect_id: order._id }).lean();
//     if (byOrderId) return byOrderId;

//     // 4) Backward-compat: if some rows used external collect_request_id, try that too
//     if (order.collect_request_id) {
//       const legacy = await this.statusModel.findOne({ collect_id: order.collect_request_id }).lean();
//       if (legacy) return legacy;
//     }

//     throw new NotFoundException('Status not found');
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private statusModel: Model<OrderStatusDocument>,
  ) {}

  async findAllStatuses() {
    return this.statusModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOrdersBySchool(schoolId: string) {
    return this.orderModel.find({ school_id: schoolId }).sort({ createdAt: -1 }).lean();
  }

  // --- PG helpers ------------------------------------------------------------

  private async fetchPgStatus(collect_request_id: string) {
    const base = process.env.PAYMENT_API_URL || 'https://dev-vanilla.edviron.com/erp';
    const apiKey = process.env.PAYMENT_API_KEY || '';
    const pgKey = process.env.PG_KEY || '';
    const school_id = process.env.SCHOOL_ID || '';

    if (!collect_request_id) return null;

    const sign = jwt.sign({ school_id, collect_request_id }, pgKey, { algorithm: 'HS256' });
    const url = `${base}/collect-request/${encodeURIComponent(
      collect_request_id,
    )}?school_id=${encodeURIComponent(school_id)}&sign=${encodeURIComponent(sign)}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 15000,
    });

    return res?.data || null; // { status: 'SUCCESS', amount: 1, details: {...}, jwt: '...' }
  }

  private async upsertStatusFromPg(order: any, pgData: any, customOrderId: string) {
    if (!pgData) return null;

    // Normalize/sanitize PG fields
    const status =
      (typeof pgData.status === 'string' ? pgData.status : String(pgData.status || 'unknown')).toLowerCase();
    const amount = typeof pgData.amount === 'number' ? pgData.amount : Number(pgData.amount ?? 0);
    const payment_time = new Date();

    const doc = await this.statusModel.findOneAndUpdate(
      { collect_id: String(order._id) }, // we store by Order._id (string)
      {
        $set: {
          status,
          order_amount: amount,
          transaction_amount: amount,
          custom_order_id: customOrderId,
          payment_time,
        },
      },
      { upsert: true, new: true, lean: true },
    );

    return doc;
  }

  // --- Main lookup -----------------------------------------------------------

  async findStatusByCustomOrderId(custom_order_id: string) {
    const coid = decodeURIComponent(custom_order_id).trim();

    // 0) If a status row was written directly with custom_order_id, return it first
    const direct = await this.statusModel.findOne({ custom_order_id: coid }).lean();
    if (direct) return direct;

    // 1) Find the Order
    const order = await this.orderModel.findOne({ custom_order_id: coid }).lean();
    if (!order) throw new NotFoundException('Order not found');

    const orderIdStr = String(order._id);

    // 2) Local lookups
    const byOrderId = await this.statusModel.findOne({ collect_id: orderIdStr }).lean();
    if (byOrderId) return byOrderId;

    if (order.collect_request_id) {
      const byExternal = await this.statusModel.findOne({ collect_id: order.collect_request_id }).lean();
      if (byExternal) return byExternal;
    }

    // 3) Auto-heal: fetch from PG, upsert locally, return
    if (order.collect_request_id) {
      const pg = await this.fetchPgStatus(order.collect_request_id);
      const upserted = await this.upsertStatusFromPg(order, pg, coid);
      if (upserted) return upserted;
    }

    throw new NotFoundException('Status not found');
  }
}