import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeaveEventService } from './leave-event.service';
import { LeaveEvent } from './leave-event.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Čuva sve rute osim getAll i getById (ako želiš)
@Controller('leave-events')
export class LeaveEventController {
  constructor(private readonly leaveEventService: LeaveEventService) {}

  // ====================== SVI EVENTI (ADMIN VIEW) ======================
  @Get()
  async getAll(): Promise<LeaveEvent[]> {
    return this.leaveEventService.getAllEvents();
  }

  // ====================== JEDNO EVENT PO ID ======================
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<LeaveEvent | null> {
    return this.leaveEventService.getEventById(id);
  }

  // ====================== KREIRAJ ODSUSTVO ======================
@Post()
async create(
  @Req() req,
  @Body() body: { leaveTypeId: string; startDate: string; endDate: string; note?: string }
): Promise<LeaveEvent> {
  console.log('REQ.USER PAYLOAD:', req.user); // <--- ovo će ti pokazati ID i polja
  const userId = req.user.userId; // ili req.user.sub, zavisi šta JWT ima
  return this.leaveEventService.createLeaveEvent(
    userId,
    body.leaveTypeId,
    new Date(body.startDate),
    new Date(body.endDate),
    body.note,
  );
}
  // ====================== ODOBRI ODSUSTVO (ADMIN) ======================
  @Patch(':id/approve')
  async approve(@Param('id', ParseUUIDPipe) id: string): Promise<LeaveEvent> {
    return this.leaveEventService.approveLeaveEvent(id);
  }

  // ====================== ODBIJ ODSUSTVO (ADMIN) ======================
 @Patch(':id/reject')
async reject(
  @Param('id', ParseUUIDPipe) id: string,
  @Body('reason') reason: string, // <-- dodajemo razlog iz body
): Promise<LeaveEvent> {
  return this.leaveEventService.rejectLeaveEvent(id, reason);
}

  // ====================== MOJA ODSUSTVA ======================
  @Get('me')
  async getMyLeaves(@Req() req) {
    const userId = req.user.id;
    return this.leaveEventService.getUserEvents(userId);
  }

  @Get('user/:userId')
async getUserLeaves(@Param('userId', ParseUUIDPipe) userId: string) {
  return this.leaveEventService.getUserEvents(userId);
}
}