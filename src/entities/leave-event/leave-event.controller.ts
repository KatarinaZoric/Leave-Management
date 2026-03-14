import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeaveEventService } from './leave-event.service';
import { LeaveEvent } from './leave-event.entity';

@Controller('leave-events')
export class LeaveEventController {
  constructor(private readonly leaveEventService: LeaveEventService) {}

  // Dohvati sva odsustva
  @Get()
  async getAll(): Promise<LeaveEvent[]> {
    return this.leaveEventService.getAllEvents();
  }

  // Dohvati jedno odsustvo po ID
  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LeaveEvent | null> {
    return this.leaveEventService.getEventById(id);
  }

  // Kreiranje odsustva
  @Post()
  async create(
    @Body()
    body: {
      userId: string;
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      note?: string;
    },
  ): Promise<LeaveEvent> {
    return this.leaveEventService.createLeaveEvent(
      body.userId,
      body.leaveTypeId,
      new Date(body.startDate),
      new Date(body.endDate),
      body.note,
    );
  }

  // Odobravanje odsustva
  @Patch(':id/approve')
  async approve(@Param('id', ParseUUIDPipe) id: string): Promise<LeaveEvent> {
    return this.leaveEventService.approveLeaveEvent(id);
  }

  // Odbijanje odsustva
  @Patch(':id/reject')
  async reject(@Param('id', ParseUUIDPipe) id: string): Promise<LeaveEvent> {
    return this.leaveEventService.rejectLeaveEvent(id);
  }
}
