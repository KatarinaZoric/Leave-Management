import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { LeaveType } from '../leave-type/leave-type.entity';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('leave_events')
export class LeaveEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.leaves)
  user: User;

  @ManyToOne(() => LeaveType)
  leaveType: LeaveType;

  @Column({
    type: 'date',
    transformer: {
      to: (value: Date) => value, // kada ide u bazu
      from: (value: string) => new Date(value), // kada dolazi iz baze
    },
  })
  startDate: Date;

  @Column({
    type: 'date',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  endDate: Date;

  @Column({ type: 'int' })
  days: number;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
rejectReason?: string;
}
