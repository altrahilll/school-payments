import { Injectable, UnauthorizedException } from '@nestjs/common';
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
