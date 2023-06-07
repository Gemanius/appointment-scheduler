import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationAppointmentEntity } from '../../appointment/entity/organization-appointment.entity';
import { AppointmentsChangesHistoryEntity } from '../../appointment/entity/appointments-changes-history.entity';

@Entity('organizations')
export class OrganizationsEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;
  @Column({ name: 'name', type: 'varchar', length: 20 })
  name: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
  @ManyToMany(
    () => OrganizationAppointmentEntity,
    (appointment) => appointment.organizations,
  )
  @JoinTable({
    name: 'organization_appointment_join_table',
    joinColumn: {
      name: 'organization_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'appointment_id',
      referencedColumnName: 'id',
    },
  })
  appointments?: OrganizationAppointmentEntity[];
  @OneToMany(
    () => AppointmentsChangesHistoryEntity,
    (changesHistory) => changesHistory.organization,
  )
  changesHistory?: AppointmentsChangesHistoryEntity[];
}
