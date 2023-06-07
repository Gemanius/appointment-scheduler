import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationAppoinmentEntity } from '../entity/organization-appoinment.entity';
import { AppoinmentsChangesHistoryEntity } from '../entity/appoinments-changes-history.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class OrganizationAppoinmentReadRepository {
  constructor(
    @InjectRepository(OrganizationAppoinmentEntity, 'read_db')
    private readonly orgAppoinmentRepository: Repository<OrganizationAppoinmentEntity>,
  ) {}
}
