import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      surname: user.surname,
    };
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

     async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Siguran query builder koji vraća hash
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password') // uzmi password iz baze
      .where('user.id = :id', { id: String(userId).trim() })
      .getOne();

    if (!user) throw new BadRequestException('Korisnik ne postoji');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Stara lozinka nije tačna');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Lozinka uspešno promenjena' };
  }

}