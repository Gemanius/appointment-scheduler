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
import { OrganizationAppoinmentEntity } from '../../appoinment/entity/organization-appoinment.entity';
import { AppoinmentsChangesHistoryEntity } from '../../appoinment/entity/appoinments-changes-history.entity';

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
    () => OrganizationAppoinmentEntity,
    (appoinment) => appoinment.organizations,
  )
  @JoinTable({
    name: 'organization_appoinment_join_table',
    joinColumn: {
      name: 'organization_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'appoinment_id',
      referencedColumnName: 'id',
    },
  })
  appoinments?: OrganizationAppoinmentEntity[];
  @OneToMany(
    () => AppoinmentsChangesHistoryEntity,
    (changesHistory) => changesHistory.organization,
  )
  changesHistory?: AppoinmentsChangesHistoryEntity[];
}
