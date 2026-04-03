import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { LeaveBalance } from './leave-balance.entity';
import { User } from '../user/user.entity';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ====================== GET BALANCE ======================
  async getBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    const balance = await this.leaveBalanceRepo.findOne({
      where: { user: { id: userId }, year },
    });

    if (!balance) return null;

    // recalculation safeguard
    balance.remainingDays = balance.totalDays - balance.usedDays;

    return balance;
  }

  // ====================== GET BALANCES INCLUDING VALID UNTIL ======================
  async getValidBalances(userId: string, date: Date = new Date()): Promise<LeaveBalance[]> {
    // vraća sve balance koje još uvek važe
    return this.leaveBalanceRepo.find({
      where: {
        user: { id: userId },
        validUntil: Between(date, new Date('2100-12-31')), // sve do kraja sveta
      },
      order: { year: 'ASC' },
    });
  }

  // ====================== ALL BALANCES ======================
  async getAllBalances(): Promise<LeaveBalance[]> {
    return this.leaveBalanceRepo.find({
      relations: ['user'],
      order: { year: 'DESC' },
    });
  }

  async createBalance(dto: CreateLeaveBalanceDto): Promise<LeaveBalance> {
  const { email, year, totalDays, remainingDays, validUntil } = dto;

  const user = await this.userRepo.findOneBy({ email });
  if (!user) throw new Error('User not found');

  const remaining = remainingDays ?? totalDays;
  const usedDays = totalDays - remaining;

  const balance = this.leaveBalanceRepo.create({
    user,
    year,
    totalDays,
    usedDays,
    remainingDays: remaining,
    validUntil: new Date(validUntil),
  });

  return this.leaveBalanceRepo.save(balance);
}

  // ====================== DEDUCT DAYS ======================
  async deductDays(userId: string, days: number, year: number): Promise<void> {
    if (days <= 0) return;

    let remainingToDeduct = days;

    // Uzimamo sve validne balance za korisnika sortirane po year asc
    const balances = await this.leaveBalanceRepo.find({
      where: { user: { id: userId }, validUntil: MoreThanOrEqual(new Date()) },
      order: { year: 'ASC' },
    });

    if (!balances || balances.length === 0)
      throw new Error('No valid leave balance found');

    for (const balance of balances) {
      if (remainingToDeduct <= 0) break;

      const available = balance.totalDays - balance.usedDays;
      const deduct = Math.min(available, remainingToDeduct);

      if (deduct > 0) {
        balance.usedDays += deduct;
        balance.remainingDays = balance.totalDays - balance.usedDays;

        await this.leaveBalanceRepo.save(balance);

        remainingToDeduct -= deduct;
      }
    }

    if (remainingToDeduct > 0)
      throw new Error('Not enough vacation days across all valid balances');
  }
}