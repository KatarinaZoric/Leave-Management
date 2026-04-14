import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user/user.entity';
import { LeaveBalance } from './entities/leave-balance/leave-balance.entity';
import { LeaveType } from './entities/leave-type/leave-type.entity';
import { LeaveEvent } from './entities/leave-event/leave-event.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'katarina0506',
  database: 'leave_management',
  entities: [User, LeaveBalance, LeaveType, LeaveEvent],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
