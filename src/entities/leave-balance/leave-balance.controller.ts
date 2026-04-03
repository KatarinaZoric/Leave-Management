import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { LeaveBalance } from './leave-balance.entity';
import { JwtPayload } from 'src/auth/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('leave-balance')
export class LeaveBalanceController {
  constructor(
    private readonly leaveBalanceService: LeaveBalanceService,
  ) {}

  // ====================== MY BALANCE ======================
  @Get(':year')
  async getMyBalance(
    @Req() req,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const userId = req.user.userId;

    const balance = await this.leaveBalanceService.getBalance(
      userId,
      year,
    );

    if (!balance) {
      return { message: 'Balance not found' };
    }

    return balance;
  }

@Get('my/all')
async getMyAllBalances(@Req() req) {
  const userId = req.user.userId;

  // vraća sve balanse za tog usera
  const balances = await this.leaveBalanceService.getValidBalances(userId);

  // mapiramo samo potrebna polja
  return balances.map(b => ({
    id: b.id,
    year: b.year,
    totalDays: b.totalDays,
    usedDays: b.usedDays,
    remainingDays: b.remainingDays,
    validUntil: b.validUntil,
  }));
}

  // ====================== CREATE BALANCE (ADMIN) ======================
  @Post()
async create(
  @Req() req: Request,
  @Body() body: CreateLeaveBalanceDto,
): Promise<LeaveBalance> {
  const user = req.user as JwtPayload;

  if (user.role !== 'ADMIN') {
    throw new Error('Only admins can create leave balances');
  }

  return this.leaveBalanceService.createBalance(body);
}

  // ====================== ALL BALANCES ======================
  @Get()
  async getAllBalances() {
    return this.leaveBalanceService.getAllBalances();
  }
}