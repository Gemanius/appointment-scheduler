import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationAppoinmentEntity } from './organization-appoinment.entity';
import { OrganizationsEntity } from '../../organization/entity/organization.entity';
import { ChangeHistoryEnum } from '../enum/changes-history.enum';

@Entity('appoinments_changes_history')
export class AppoinmentsChangesHistoryEntity {
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
    () => OrganizationAppoinmentEntity,
    (appoinment) => appoinment.history,
  )
  @JoinColumn({ name: 'appoinment_id', referencedColumnName: 'id' })
  appoinment: OrganizationAppoinmentEntity;
}
