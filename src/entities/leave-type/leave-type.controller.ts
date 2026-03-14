import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LeaveTypeService } from './leave-type.service';
import { LeaveType } from './leave-type.entity';

@Controller('leave-types')
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Get()
  async getAllTypes(): Promise<LeaveType[]> {
    return this.leaveTypeService.getAllTypes();
  }

  @Get(':id')
  async getType(@Param('id') id: string): Promise<LeaveType | null> {
    return this.leaveTypeService.getTypeById(id);
  }

  @Post()
  async createType(
    @Body() body: { name: string; countsAsVacation: boolean; color: string },
  ): Promise<LeaveType> {
    return this.leaveTypeService.createType(
      body.name,
      body.countsAsVacation,
      body.color,
    );
  }

  @Patch(':id')
  async updateType(
    @Param('id') id: string,
    @Body() body: Partial<LeaveType>,
  ): Promise<LeaveType> {
    return this.leaveTypeService.updateType(id, body);
  }

  @Delete(':id')
  async deleteType(@Param('id') id: string): Promise<void> {
    return this.leaveTypeService.deleteType(id);
  }
}
