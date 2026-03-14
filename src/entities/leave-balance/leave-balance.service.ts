import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Dohvat balansa za konkretnu godinu
  async getBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    return this.leaveBalanceRepo.findOne({
      where: { user: { id: userId }, year },
    });
  }

  // Kreiranje balansa za godinu
  async createBalance(dto: CreateLeaveBalanceDto): Promise<LeaveBalance> {
    const { userId, year, totalDays, remainingDays } = dto;
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const remaining = remainingDays ?? totalDays; // Ako nije prosleđeno, preostali = total
    const usedDays = totalDays - remaining;

    const balance = this.leaveBalanceRepo.create({
      user,
      year,
      totalDays,
      usedDays,
      remainingDays: remaining,
    });

    return this.leaveBalanceRepo.save(balance);
  }

  // Oduzimanje dana za godišnji
  async deductDays(userId: string, days: number, year: number): Promise<void> {
    if (days <= 0) return;

    // Prvo pokušaj oduzeti iz prethodne godine
    const prevYear = year - 1;
    const prevBalance = await this.getBalance(userId, prevYear);
    if (prevBalance) {
      const available = prevBalance.totalDays - prevBalance.usedDays;
      const deduct = Math.min(available, days);
      if (deduct > 0) {
        prevBalance.usedDays += deduct;
        prevBalance.remainingDays =
          prevBalance.totalDays - prevBalance.usedDays; // <-- ažuriranje
        days -= deduct;
        await this.leaveBalanceRepo.save(prevBalance);
      }
    }

    // Ako ostanu dani, skidamo iz tekuće godine
    if (days > 0) {
      const currBalance = await this.getBalance(userId, year);
      if (!currBalance) throw new Error('Current year balance not found');

      const available = currBalance.totalDays - currBalance.usedDays;
      if (available < days) throw new Error('Not enough vacation days');

      currBalance.usedDays += days;
      currBalance.remainingDays = currBalance.totalDays - currBalance.usedDays; // <-- ažuriranje
      await this.leaveBalanceRepo.save(currBalance);
    }
  }
}
