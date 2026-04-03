import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findOneBy({ id });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data);
    return this.getUserById(id) as Promise<User>;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
