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

  // Kreiranje novog odsustva
  async createLeaveEvent(
    userId: string,
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
    note?: string,
  ): Promise<LeaveEvent> {

  const overlappingEvent = await this.leaveEventRepo
  .createQueryBuilder('event')
  .where('event.userId = :userId', { userId })
  .andWhere(
    'event.startDate <= :endDate AND event.endDate >= :startDate',
    { startDate, endDate },
  )
  .andWhere('event.status IN (:...statuses)', {
  statuses: ['PENDING', 'APPROVED'],
  })
  .getOne();

  if (overlappingEvent) {
  throw new Error('Zaposleni je vec zatražio odsustvo u tom periodu');
  }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const leaveType = await this.leaveTypeRepo.findOneBy({ id: leaveTypeId });
    if (!leaveType) throw new Error('Leave type not found');

    const days = this.calculateWorkingDays(startDate, endDate);

    if (days === 0) {
    throw new Error('Označeni period je vikend');
    }

    const leaveEvent = this.leaveEventRepo.create({
      user,
      leaveType,
      startDate,
      endDate,
      days,
      status: LeaveStatus.PENDING,
      note,
    });

    return this.leaveEventRepo.save(leaveEvent);
  }

  // Odobravanje odsustva
  async approveLeaveEvent(id: string): Promise<LeaveEvent> {
    const event = await this.leaveEventRepo.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });
    if (!event) throw new Error('Leave event not found');

    if (event.status !== LeaveStatus.PENDING)
      throw new Error('Leave event already processed');

    // Ako je tip odsustva koji troši dane godišnjeg, skidamo dane iz LeaveBalance
    if (event.leaveType.countsAsVacation) {
      const year = event.startDate.getFullYear();
      await this.leaveBalanceService.deductDays(
        event.user.id,
        event.days,
        year,
      );
    }

    event.status = LeaveStatus.APPROVED;
    return this.leaveEventRepo.save(event);
  }

  // Odbijanje odsustva
  async rejectLeaveEvent(id: string): Promise<LeaveEvent> {
    const event = await this.leaveEventRepo.findOneBy({ id });
    if (!event) throw new Error('Leave event not found');

    if (event.status !== LeaveStatus.PENDING)
      throw new Error('Leave event already processed');

    event.status = LeaveStatus.REJECTED;
    return this.leaveEventRepo.save(event);
  }

  // Dohvatanje svih odsustava
  async getAllEvents(): Promise<LeaveEvent[]> {
    return this.leaveEventRepo.find({ relations: ['user', 'leaveType'] });
  }

  // Dohvatanje jednog odsustva po id
  async getEventById(id: string): Promise<LeaveEvent | null> {
    return this.leaveEventRepo.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
  let days = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();

    // 0 = nedelja, 6 = subota
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }

    current.setDate(current.getDate() + 1);
  }

  return days;
}
}
