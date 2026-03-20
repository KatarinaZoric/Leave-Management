// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/entities/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return user;
  }

  async login(user: User) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = this.jwtService.sign(payload);

  return {
    access_token: token,
    role: user.role,
  };
}

  async register(
  email: string,
  password: string,
  name: string,
  surname: string,
  role: UserRole = UserRole.EMPLOYEE,
) {
  const hashed = await bcrypt.hash(password, 10);

  const user = this.userRepo.create({
    email,
    password: hashed,
    name,
    surname,
    role,
  });

  await this.userRepo.save(user);
  return user;
  }
}