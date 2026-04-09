import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user/user.entity';
import { LeaveBalance } from './entities/leave-balance/leave-balance.entity';
import { LeaveType } from './entities/leave-type/leave-type.entity';
import { LeaveEvent } from './entities/leave-event/leave-event.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, LeaveBalance, LeaveType, LeaveEvent],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});