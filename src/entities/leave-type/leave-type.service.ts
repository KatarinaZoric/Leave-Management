import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from './leave-type.entity';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,
  ) {}

  async createType(
    name: string,
    countsAsVacation: boolean,
    color: string,
  ): Promise<LeaveType> {
    const type = this.leaveTypeRepo.create({ name, countsAsVacation, color });
    return this.leaveTypeRepo.save(type);
  }

  async getAllTypes(): Promise<LeaveType[]> {
    return this.leaveTypeRepo.find();
  }

  async getTypeById(id: string): Promise<LeaveType | null> {
    return this.leaveTypeRepo.findOneBy({ id });
  }

  async updateType(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
    await this.leaveTypeRepo.update(id, data);
    return this.getTypeById(id) as Promise<LeaveType>;
  }

  async deleteType(id: string): Promise<void> {
    await this.leaveTypeRepo.delete(id);
  }
}
