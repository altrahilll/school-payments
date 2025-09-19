const fs = require("fs");
const path = require("path");
const files = {
  "package.json": `{
  "name": "school-payments-backend",
  "version": "1.0.0",
  "description": "NestJS + MongoDB backend for school payments",
  "main": "dist/main.js",
  "license": "MIT",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main.js"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "axios": "^1.7.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "dotenv": "^16.4.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.6.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.0"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "lib": ["es2017"]
  },
  "exclude": ["node_modules", "dist"]
}
`,
  "tsconfig.build.json": `{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
`,
  "nest-cli.json": `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
`,
  ".env": `MONGO_URI=mongodb+srv://exam:rahil123@cluster0.povf97s.mongodb.net/school_payments?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=superSecretKey
JWT_EXPIRES_IN=7d
PG_KEY=edvtest01
PAYMENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
SCHOOL_ID=65b0e6293e9f76a9694d84b4
PAYMENT_API_URL=https://dev-vanilla.edviron.com/erp
PORT=3000
`,
  "src/main.ts": `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 Backend running on http://localhost:' + (process.env.PORT || 3000));
}
bootstrap();
`,
  "src/app.module.ts": `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    AuthModule,
    PaymentsModule,
    TransactionsModule,
    WebhookModule,
  ],
})
export class AppModule {}
`,
  "src/schemas/user.schema.ts": `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop({ default: 'user' }) role: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
`,
  "src/schemas/order.schema.ts": `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true }) school_id: string;
  @Prop({ type: Object, required: true }) student_info: { name: string; id: string; email: string };
  @Prop({ unique: true }) custom_order_id: string;
  @Prop() amount: number;
  @Prop() collect_request_id?: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
`,
  "src/schemas/order-status.schema.ts": `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true }) collect_id: string;
  @Prop() order_amount: number;
  @Prop() transaction_amount: number;
  @Prop() status?: string;
  @Prop() custom_order_id?: string;
  @Prop({ type: Date }) payment_time?: Date;
}
export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
`,
  "src/schemas/webhook-log.schema.ts": `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ type: Object }) payload: any;
}
export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);
`,
  "src/users/users.module.ts": `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`,
  "src/users/users.service.ts": `import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(name: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email already exists');
    const hashed = await bcrypt.hash(password, 10);
    const u = new this.userModel({ name, email, password: hashed });
    return u.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
`,
  "src/auth/auth.module.ts": `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
`,
  "src/auth/auth.service.ts": `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    const payload = { sub: String(user._id), email: user.email, role: user.role };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: String(user._id), email: user.email, role: user.role };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
`,
  "src/auth/auth.controller.ts": `import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;
}

class LoginDto {
  @IsEmail() email: string;
  @MinLength(6) password: string;
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
`,
  "src/auth/jwt.strategy.ts": `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
`,
  "src/payments/payments.module.ts": `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
    ]),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
`,
  "src/payments/payments.service.ts": `import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    } catch (err) {
      throw new InternalServerErrorException((err && err.message) ? err.message : 'Failed to create payment');
    }
  }
}
`,
  "src/payments/payments.controller.ts": `import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

class StudentInfoDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() id: string;
  @IsEmail() email: string;
}

class CreatePaymentDto {
  student_info: StudentInfoDto;
  @IsNumber() @Min(1) amount: number;
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
`,
  "src/transactions/transactions.module.ts": `import { Module } from '@nestjs/common';
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
`,
  "src/transactions/transactions.service.ts": `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findStatusByCustomOrderId(custom_order_id: string) {
    const status = await this.statusModel.findOne({ custom_order_id }).lean();
    if (status) return status;

    const order = await this.orderModel.findOne({ custom_order_id }).lean();
    if (!order) throw new NotFoundException('Order not found');

    const byCollect = await this.statusModel.findOne({ collect_id: order.collect_request_id }).lean();
    if (!byCollect) throw new NotFoundException('Status not found');
    return byCollect;
  }
}
`,
  "src/transactions/transactions.controller.ts": `import { Controller, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  all() {
    return this.txService.findAllStatuses();
  }

  @Get('school/:schoolId')
  bySchool(@Param('schoolId') schoolId: string) {
    return this.txService.findOrdersBySchool(schoolId);
  }
}

@Controller()
export class TransactionStatusController {
  constructor(private readonly txService: TransactionsService) {}

  @Get('transaction-status/:custom_order_id')
  status(@Param('custom_order_id') customOrderId: string) {
    return this.txService.findStatusByCustomOrderId(customOrderId);
  }
}
`,
  "src/webhook/webhook.module.ts": `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookLog, WebhookLogSchema } from '../schemas/webhook-log.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookLog.name, schema: WebhookLogSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
`,
  "src/webhook/webhook.service.ts": `import { Injectable } from '@nestjs/common';
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
`,
  "src/webhook/webhook.controller.ts": `import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  receive(@Body() payload: any) {
    return this.webhookService.handle(payload);
  }
}
`,
};
for (const [rel, content] of Object.entries(files)) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, "utf8");
}
console.log("Files written.");
