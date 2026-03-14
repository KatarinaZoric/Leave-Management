import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveEvent } from './leave-event.entity';
import { LeaveType } from '../leave-type/leave-type.entity';
import { LeaveBalanceService } from '../leave-balance/leave-balance.service';
import { LeaveBalance } from '../leave-balance/leave-balance.entity';
import { User } from '../user/user.entity';
import { LeaveEventService } from './leave-event.service';
import { LeaveEventController } from './leave-event.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveEvent, User, LeaveType, LeaveBalance]),
  ],
  controllers: [LeaveEventController],
  providers: [LeaveEventService, LeaveBalanceService],
})
export class LeaveEventModule {}
