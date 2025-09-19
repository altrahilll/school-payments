import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true, collection: 'order_statuses' })
export class OrderStatus {
  // Reference to Order(_id) as per spec
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  collect_id!: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number }) order_amount!: number;
  @Prop({ type: Number }) transaction_amount!: number;

  @Prop({ type: String }) payment_mode?: string;
  @Prop({ type: String }) payment_details?: string;
  @Prop({ type: String }) bank_reference?: string;
  @Prop({ type: String }) payment_message?: string;

  @Prop({ type: String }) status?: string;
  @Prop({ type: String }) error_message?: string;

  @Prop({ type: Date, index: true }) payment_time?: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

OrderStatusSchema.index({ status: 1, payment_time: -1 });