/* eslint-disable @typescript-eslint/no-unsafe-call */
// leave-balance.dto.ts
import { IsInt, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(2000) // ili bilo koja minimalna godina koju želiš
  year: number;

  @IsInt()
  @IsPositive()
  totalDays: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  remainingDays?: number; // opcionalno, ako se ne prosledi, koristi totalDays
}
