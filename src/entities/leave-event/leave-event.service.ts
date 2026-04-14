import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveEvent, LeaveStatus } from './leave-event.entity';
import { LeaveType } from '../leave-type/leave-type.entity';
import { LeaveBalanceService } from '../leave-balance/leave-balance.service';
import { User } from '../user/user.entity';

@Injectable()
export class LeaveEventService {
  constructor(
    @InjectRepository(LeaveEvent)
    private readonly leaveEventRepo: Repository<LeaveEvent>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,

    private readonly leaveBalanceService: LeaveBalanceService,
  ) {}

  // ====================== CREATE ======================
  async createLeaveEvent(
    userId: string,
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
    note?: string,
  ): Promise<LeaveEvent> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const leaveType = await this.leaveTypeRepo.findOneBy({ id: leaveTypeId });
    if (!leaveType) throw new Error('Leave type not found');

    // Provera preklapanja PENDING ili APPROVED
    const overlapping = await this.leaveEventRepo
      .createQueryBuilder('event')
      .where('event.userId = :userId', { userId })
      .andWhere('event.startDate <= :endDate AND event.endDate >= :startDate', { startDate, endDate })
      .andWhere('event.status IN (:...statuses)', { statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED] })
      .getOne();

    if (overlapping) throw new Error('Vec postoji odsustvo u tom periodu');

    const days = this.calculateWorkingDays(startDate, endDate);
    if (days === 0) throw new Error('Period se sastoji samo od vikenda');

    const event = this.leaveEventRepo.create({
      user,
      leaveType,
      startDate,
      endDate,
      days,
      status: LeaveStatus.PENDING,
      note,
    });

    return this.leaveEventRepo.save(event);
  }

  // ====================== APPROVE ======================
  async approveLeaveEvent(id: string): Promise<LeaveEvent> {
  const event = await this.leaveEventRepo.findOne({
    where: { id },
    relations: ['user', 'leaveType'],
  });

  if (!event) throw new Error('Leave event not found');
  if (event.status !== LeaveStatus.PENDING)
    throw new Error('Event already processed');

  // Dedukcija dana ako leave type računa kao godišnji
  if (event.leaveType.countsAsVacation) {
    const year = event.startDate.getFullYear();
    await this.leaveBalanceService.deductDays(event.user.id, event.days, year);
  }

  event.status = LeaveStatus.APPROVED;
  return this.leaveEventRepo.save(event);
}

async rejectLeaveEvent(id: string, reason: string): Promise<LeaveEvent> {
  const event = await this.leaveEventRepo.findOne({
    where: { id },
    relations: ['user', 'leaveType'],
  });

  if (!event) throw new Error('Leave event not found');
  if (event.status !== LeaveStatus.PENDING)
    throw new Error('Event already processed');

  event.status = LeaveStatus.REJECTED;
  event.rejectReason = reason; // čuvamo razlog odbijanja

  return this.leaveEventRepo.save(event);
}

  // ====================== GET ALL ======================
  async getAllEvents(): Promise<LeaveEvent[]> {
    return this.leaveEventRepo.find({ relations: ['user', 'leaveType'], order: { startDate: 'DESC' } });
  }

  // ====================== GET ONE ======================
  async getEventById(id: string): Promise<LeaveEvent | null> {
    return this.leaveEventRepo.findOne({ where: { id }, relations: ['user', 'leaveType'] });
  }

  // ====================== GET BY USER ======================
  async getUserEvents(userId: string): Promise<LeaveEvent[]> {
    return this.leaveEventRepo.find({
      where: { user: { id: userId } },
      relations: ['leaveType'],
      order: { startDate: 'DESC' },
    });
  }

  // ====================== WORKING DAYS CALC ======================
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // ====================== CANCEL ======================
async cancelLeaveEvent(
  eventId: string,
  userId: string,
): Promise<LeaveEvent> {

  const event = await this.leaveEventRepo.findOne({
    where: { id: eventId },
    relations: ['user', 'leaveType'],
  });

  if (!event) throw new Error('Leave event not found');

  // ✔ korisnik može samo svoje
  if (event.user.id !== userId)
    throw new Error('Nemate dozvolu za otkazivanje');

  // ✔ samo pending ili approved
  if (
    event.status !== LeaveStatus.APPROVED &&
    event.status !== LeaveStatus.PENDING
  ) {
    throw new Error('Odsustvo se ne može otkazati');
  }

  // ✔ VRACANJE DANA AKO JE VEC ODOBRENO
  if (
    event.status === LeaveStatus.APPROVED &&
    event.leaveType.countsAsVacation
  ) {
    const year = event.startDate.getFullYear();

    await this.leaveBalanceService.addDaysBack(
      event.user.id,
      event.days,
      year,
    );
  }

  event.status = LeaveStatus.CANCELLED;

  return this.leaveEventRepo.save(event);
}
}