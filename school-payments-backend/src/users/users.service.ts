import { Injectable, BadRequestException } from '@nestjs/common';
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