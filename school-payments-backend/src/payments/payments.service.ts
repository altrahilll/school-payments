import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

interface CreatePaymentInput {
  student_info: { name: string; id: string; email: string };
  amount: number; // INR
  callback_url?: string;
  gateway_name?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private statusModel: Model<OrderStatusDocument>,
  ) {}

  private generateCustomOrderId(studentId: string) {
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    return (process.env.SCHOOL_ID || 'SCHOOL') + '-' + studentId + '-' + Date.now() + '-' + rnd;
  }

  async createPayment(input: CreatePaymentInput, authUser: any) {
    try {
      // Validate
      if (!input?.student_info) throw new BadRequestException('student_info is required');
      const { id, name, email } = input.student_info as any;
      if (!id || !name || !email) throw new BadRequestException('student_info.id/name/email required');
      if (typeof input.amount !== 'number' || !isFinite(input.amount) || input.amount < 1) {
        throw new BadRequestException('amount must be a positive number');
      }

      const custom_order_id = this.generateCustomOrderId(id);
      const order = await this.orderModel.create({
        school_id: process.env.SCHOOL_ID,
        student_info: input.student_info,
        custom_order_id,
        amount: input.amount,
        gateway_name: input.gateway_name || 'Edviron',
      });

      // PG request (per docs)
      const base = process.env.PAYMENT_API_URL || 'https://dev-vanilla.edviron.com/erp';
      const path = process.env.PAY_COLLECT_PATH || '/create-collect-request';
      const apiKey = process.env.PAYMENT_API_KEY || '';
      const pgKey = process.env.PG_KEY || '';
      const school_id = process.env.SCHOOL_ID || '';
      const callback_url = input.callback_url || 'https://google.com';
      const amountStr = String(input.amount);

      // sign = JWT(school_id, amount, callback_url) with PG key
      const sign = jwt.sign(
        { school_id, amount: amountStr, callback_url },
        pgKey,
        { algorithm: 'HS256' },
      );

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        school_id,
        amount: amountStr,
        callback_url,
        sign,
      };

      const res = await axios.post(`${base}${path}`, payload, { headers, timeout: 15000 });

      // Map response
      const data = res?.data || {};
      const collect_request_id: string =
        data.collect_request_id || data.collectRequestId || data.id || `COLLECT-${Date.now()}`;
      const payment_url: string =
        data.Collect_request_url || data.collect_request_url || data.payment_url;

      // persist and seed status
      order.collect_request_id = String(collect_request_id);
      await order.save();

      await this.statusModel.create({
        collect_id: order._id, // reference to Order(_id)
        order_amount: input.amount,
        transaction_amount: 0,
        status: 'created',
      });

      return { ok: true, payment_url, collect_request_id, order };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status) {
        this.logger.error(`PG ${status}: ${JSON.stringify(body)}`);
        throw new BadRequestException(typeof body === 'string' ? body : body?.message || body?.error || 'Payment API error');
      }
      if (err?.status === 400) throw err;
      this.logger.error(err?.message || err);
      throw new InternalServerErrorException(err?.message ?? 'Failed to create payment');
    }
  }

  async checkStatus(collect_request_id: string) {
    try {
      const base = process.env.PAYMENT_API_URL || 'https://dev-vanilla.edviron.com/erp';
      const apiKey = process.env.PAYMENT_API_KEY || '';
      const pgKey = process.env.PG_KEY || '';
      const school_id = process.env.SCHOOL_ID || '';

      // sign = JWT(school_id, collect_request_id)
      const sign = jwt.sign(
        { school_id, collect_request_id },
        pgKey,
        { algorithm: 'HS256' },
      );

      const url = `${base}/collect-request/${encodeURIComponent(collect_request_id)}?school_id=${encodeURIComponent(school_id)}&sign=${encodeURIComponent(sign)}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 15000,
      });

      const data = res?.data || {};
      return {
        ok: true,
        status: data.status,
        amount: data.amount,
        details: data.details,
        jwt: data.jwt,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status) throw new BadRequestException(typeof body === 'string' ? body : body?.message || body?.error || 'Payment API error');
      throw new InternalServerErrorException(err?.message ?? 'Failed to check status');
    }
  }
}