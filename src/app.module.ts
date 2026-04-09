import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './entities/user/user.module';
import { LeaveBalanceModule } from './entities/leave-balance/leave-balance.module';
import { LeaveTypeModule } from './entities/leave-type/leave.type.module';
import { LeaveEventModule } from './entities/leave-event/leave-event.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: ['dist/migrations/*.js'],
        logging: true,
        extra: { ssl: { rejectUnauthorized: false } }, // obavezno za Supabase
      }),
    }),
    UsersModule,
    LeaveTypeModule,
    LeaveEventModule,
    LeaveBalanceModule,
    AuthModule,
  ],
})
export class AppModule {}