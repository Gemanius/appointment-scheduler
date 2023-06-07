import { TypeOrmModule } from '@nestjs/typeorm';
import { AppoinmentController } from './appoinment.controller';
import { AppoinmentService } from './appoinment.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OrganizationAppoinmentReadRepository } from './repository/appoinment.read.repository';
import { OrganizationAppoinmentWriteRepository } from './repository/appoinment.write.repository';
import { OrganizationAppoinmentEntity } from './entity/organization-appoinment.entity';
import { AppoinmentsChangesHistoryEntity } from './entity/appoinments-changes-history.entity';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [
    OrganizationModule,
    TypeOrmModule.forFeature(
      [OrganizationAppoinmentEntity, AppoinmentsChangesHistoryEntity],
      'read_db',
    ),
    TypeOrmModule.forFeature(
      [OrganizationAppoinmentEntity, AppoinmentsChangesHistoryEntity],
      'write_db',
    ),
  ],
  controllers: [AppoinmentController],
  providers: [
    AppoinmentService,
    OrganizationAppoinmentReadRepository,
    OrganizationAppoinmentWriteRepository,
  ],
})
export class AppoinmentModule {}
