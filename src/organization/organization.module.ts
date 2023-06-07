import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OrganizationReadRepository } from './repository/organization.read.repository';
import { OrganizationWriteRepository } from './repository/organization.write.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsEntity } from './entity/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationsEntity], 'write_db'),
    TypeOrmModule.forFeature([OrganizationsEntity], 'read_db'),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationReadRepository,
    OrganizationWriteRepository,
  ],
  exports: [OrganizationWriteRepository, OrganizationReadRepository],
})
export class OrganizationModule {}
