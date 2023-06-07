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
import { AppoinmentsChangesHistoryEntity } from './appoinments-changes-history.entity';

// ToDo
/*
    we can put isInvitationAccepted for when an organization set appoinments for other one
    and consider it impacts on our appoinment validations
*/

@Entity('organization_appoinment')
export class OrganizationAppoinmentEntity {
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
    (organization) => organization.appoinments,
  )
  organizations: OrganizationsEntity[];
  @OneToMany(
    () => AppoinmentsChangesHistoryEntity,
    (history) => history.appoinment,
  )
  history: AppoinmentsChangesHistoryEntity[];
}
