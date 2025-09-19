// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';

// export type OrderDocument = Order & Document;

// @Schema({ timestamps: true, collection: 'orders' })
// export class Order {
//   @Prop({ type: MongooseSchema.Types.Mixed, required: true })
//   school_id!: string | MongooseSchema.Types.ObjectId;

//   @Prop({ type: MongooseSchema.Types.Mixed })
//   trustee_id?: string | MongooseSchema.Types.ObjectId;

//   @Prop({ type: Object, required: true })
//   student_info!: { name: string; id: string; email: string };

//   @Prop({ type: String, required: true, default: 'Unknown' })
//   gateway_name!: string;

//   @Prop({ type: String, unique: true, index: true })
//   custom_order_id!: string;

//   @Prop({ type: String, index: true })
//   collect_request_id?: string;
// }

// export const OrderSchema = SchemaFactory.createForClass(Order);

// // indexes helpful for queries
// OrderSchema.index({ school_id: 1, createdAt: -1 });
// OrderSchema.index({ custom_order_id: 1 }, { unique: true, sparse: true });
// OrderSchema.index({ collect_request_id: 1 }, { sparse: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  school_id!: string | MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, required: true })
  student_info!: { name: string; id: string; email: string };

  // remove "index: true" and don't also declare a schema.index for this field
  @Prop({ unique: true })
  custom_order_id!: string;

  // ensure NO "index: true" here; we'll index via schema.index below
  @Prop()
  collect_request_id?: string;

  @Prop({ type: String, required: true, default: 'Unknown' })
  gateway_name!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Keep only one index declaration per field.
// Removed: OrderSchema.index({ custom_order_id: 1 }, { unique: true, sparse: true });
OrderSchema.index({ collect_request_id: 1 }, { sparse: true });
OrderSchema.index({ school_id: 1, createdAt: -1 });