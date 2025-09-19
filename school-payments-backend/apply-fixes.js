const fs = require("fs"); const p = require("path");
const W = (rel, content) => { const fp = p.join(process.cwd(), rel); fs.mkdirSync(p.dirname(fp), {recursive:true}); fs.writeFileSync(fp, content, "utf8"); };

W("src/app.module.ts", `import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URI') || 'mongodb://127.0.0.1:27017/school_payments',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PaymentsModule,
    TransactionsModule,
    WebhookModule,
  ],
})
export class AppModule {}
`);

W("src/auth/auth.controller.ts", `import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}

class LoginDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
`);

W("src/payments/payments.controller.ts", `import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

class StudentInfoDto {
  @IsNotEmpty() name!: string;
  @IsNotEmpty() id!: string;
  @IsEmail() email!: string;
}

class CreatePaymentDto {
  student_info!: StudentInfoDto;
  @IsNumber() @Min(1) amount!: number;
  @IsOptional() @IsUrl() callback_url?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.createPayment(dto, req.user);
  }
}
`);

W("src/payments/payments.service.ts", `import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

interface CreatePaymentInput {
  student_info: { name: string; id: string; email: string };
  amount: number;
  callback_url?: string;
}

@Injectable()
export class PaymentsService {
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
      const custom_order_id = this.generateCustomOrderId(input.student_info.id);
      const order = await this.orderModel.create({
        school_id: process.env.SCHOOL_ID,
        student_info: input.student_info,
        custom_order_id,
        amount: input.amount,
      });

      const base = process.env.PAYMENT_API_URL || '';
      const apiKey = process.env.PAYMENT_API_KEY || '';
      const pgKey = process.env.PG_KEY || '';

      const signature = jwt.sign(
        { school_id: process.env.SCHOOL_ID, custom_order_id, ts: Date.now() },
        pgKey || 'pg_local_secret',
        { expiresIn: '10m' },
      );

      const payload = {
        schoolId: process.env.SCHOOL_ID,
        customOrderId: custom_order_id,
        amount: input.amount,
        student: input.student_info,
        callbackUrl: input.callback_url || 'https://example.com/callback',
        createdBy: (authUser && authUser.email) ? authUser.email : 'system',
      };

      const res = await axios.post(
        base + "/pg/collect",
        payload,
        {
          headers: {
            Authorization: "Bearer " + apiKey,
            "x-signature": signature,
            "pg-key": pgKey,
            "content-type": "application/json",
          },
          timeout: 15000,
        },
      );

      const data = (res && res.data) ? res.data : {};
      const collectId =
        data.collectId || (data.data && data.data.collectId) || (data.data && data.data.id) || data.id || ("COLLECT-" + Date.now());

      const payment_url =
        data.payment_url || (data.data && data.data.payment_url) || (base ? (base + "/pg/pay/" + collectId) : ("https://example.com/pay/" + collectId));

      order.collect_request_id = collectId;
      await order.save();

      await this.statusModel.create({
        collect_id: collectId,
        order_amount: input.amount,
        transaction_amount: 0,
        status: 'created',
        custom_order_id: custom_order_id,
      });

      return { ok: true, payment_url, order };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'Failed to create payment');
    }
  }
}
`);

W("src/schemas/user.schema.ts", `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, unique: true }) email!: string;
  @Prop({ required: true }) password!: string;
  @Prop({ default: 'user' }) role!: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
`);

W("src/schemas/order.schema.ts", `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true }) school_id!: string;
  @Prop({ type: Object, required: true }) student_info!: { name: string; id: string; email: string };
  @Prop({ unique: true }) custom_order_id!: string;
  @Prop() amount!: number;
  @Prop() collect_request_id?: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
`);

W("src/schemas/order-status.schema.ts", `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true }) collect_id!: string;
  @Prop() order_amount!: number;
  @Prop() transaction_amount!: number;
  @Prop() status?: string;
  @Prop() custom_order_id?: string;
  @Prop({ type: Date }) payment_time?: Date;
}
export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
`);
console.log("Updated files.");
