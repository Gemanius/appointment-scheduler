import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationAppointmentEntity } from './organization-appointment.entity';
import { OrganizationsEntity } from '../../organization/entity/organization.entity';
import { ChangeHistoryEnum } from '../enum/changes-history.enum';

@Entity('appointments_changes_history')
export class AppointmentsChangesHistoryEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;
  @Column({ name: 'action', enum: ChangeHistoryEnum, nullable: false })
  action: ChangeHistoryEnum;
  @Column({ name: 'new_start_date', type: 'timestamp', nullable: true })
  startDate?: Date;
  @Column({ name: 'new_end_date', type: 'timestamp', nullable: true })
  endDate?: Date;
  @CreateDateColumn({ name: 'created_at', type: 'date' })
  createdAt: Date;
  @ManyToOne(
    () => OrganizationsEntity,
    (organization) => organization.changesHistory,
  )
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'id',
  })
  organization: OrganizationsEntity;
  @ManyToOne(
    () => OrganizationAppointmentEntity,
    (appointment) => appointment.history,
  )
  @JoinColumn({ name: 'appointment_id', referencedColumnName: 'id' })
  appointment: OrganizationAppointmentEntity;
}
