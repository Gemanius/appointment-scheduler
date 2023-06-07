import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationsEntity } from '../../organization/entity/organization.entity';
import { AppointmentsChangesHistoryEntity } from './appointments-changes-history.entity';

// ToDo
/*
    we can put isInvitationAccepted for when an organization set appointments for other one
    and consider it impacts on our appointment validations
*/

@Entity('organization_appointment')
export class OrganizationAppointmentEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;
  @Column({ name: 'start_date', type: 'timestamptz', nullable: false })
  startDate: Date;
  @Column({ name: 'end_date', type: 'timestamptz', nullable: false })
  endDate: Date;
  @Column({ name: 'soft_delete', type: 'boolean', default: false })
  softDelete: boolean;
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @ManyToMany(
    () => OrganizationsEntity,
    (organization) => organization.appointments,
  )
  organizations: OrganizationsEntity[];
  @OneToMany(
    () => AppointmentsChangesHistoryEntity,
    (history) => history.appointment,
  )
  history: AppointmentsChangesHistoryEntity[];
}
