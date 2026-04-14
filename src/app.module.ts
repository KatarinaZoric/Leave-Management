import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './entities/user/user.module';
import { LeaveBalanceModule } from './entities/leave-balance/leave-balance.module';
import { LeaveTypeModule } from './entities/leave-type/leave.type.module';
import { LeaveEventModule } from './entities/leave-event/leave-event.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
}),

    UsersModule,
    LeaveTypeModule,
    LeaveEventModule,
    LeaveBalanceModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
