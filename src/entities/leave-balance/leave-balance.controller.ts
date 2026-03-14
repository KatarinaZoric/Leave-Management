import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';

@Controller('leave-balance')
export class LeaveBalanceController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Get(':userId/:year')
  async getBalance(
    @Param('userId') userId: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const balance = await this.leaveBalanceService.getBalance(userId, year);
    if (!balance) return { message: 'Balance not found' };
    return balance;
  }

  @Post()
  async createBalance(@Body() dto: CreateLeaveBalanceDto) {
    return this.leaveBalanceService.createBalance(dto);
  }
}
