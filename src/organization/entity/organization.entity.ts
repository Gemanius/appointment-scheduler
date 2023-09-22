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
  @Column({ name: 'name', type: 'varchar', length: 30 })
  name: string;
  @Column({ name: 'profile_image', type: 'varchar', length: 100 })
  image: string;
  @Column({ name: 'email', type: 'varchar', length: 50 })
  email: string;
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
