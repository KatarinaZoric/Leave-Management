import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('leave_balance')
export class LeaveBalance {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.balances, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  year: number;

  @Column()
  totalDays: number;

  @Column({ default: 0 })
  usedDays: number;

  @Column()
  remainingDays: number;

  @Column({ type: 'date' })
  validUntil: Date;
}