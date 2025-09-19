const fs = require("fs"), p = require("path");
const W = (rel,c)=>{const f=p.join(process.cwd(),rel);fs.mkdirSync(p.dirname(f),{recursive:true});fs.writeFileSync(f,c,"utf8")};

W("src/auth/jwt.strategy.ts", `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
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

W("src/users/users.module.ts", `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);

W("src/users/users.service.ts", `import { Injectable, BadRequestException } from '@nestjs/common';
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
`);
console.log("Applied fixes.");
