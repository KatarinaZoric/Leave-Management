import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // npr. "Godišnji", "Bolovanje", "Slobodan dan"

  @Column()
  color: string; // boja za prikaz u kalendaru

  @Column({ default: false })
  countsAsVacation: boolean; // da li oduzima dane godišnjeg
}
