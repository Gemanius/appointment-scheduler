import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OrganizationAppointmentReadRepository } from './repository/appointment.read.repository';

import { OrganizationAppointmentEntity } from './entity/organization-appointment.entity';
import { AppointmentsChangesHistoryEntity } from './entity/appointments-changes-history.entity';
import { OrganizationModule } from 'src/organization/organization.module';
import { OrganizationAppointmentWriteRepository } from './repository/appoinment.write.repository';

@Module({
  imports: [
    OrganizationModule,
    TypeOrmModule.forFeature(
      [OrganizationAppointmentEntity, AppointmentsChangesHistoryEntity],
      'read_db',
    ),
    TypeOrmModule.forFeature(
      [OrganizationAppointmentEntity, AppointmentsChangesHistoryEntity],
      'write_db',
    ),
  ],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    OrganizationAppointmentReadRepository,
    OrganizationAppointmentWriteRepository,
  ],
})
export class AppointmentModule {}
