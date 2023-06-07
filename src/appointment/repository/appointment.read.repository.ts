import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationAppointmentEntity } from '../entity/organization-appointment.entity';
import { AppointmentsChangesHistoryEntity } from '../entity/appointments-changes-history.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class OrganizationAppointmentReadRepository {
  constructor(
    @InjectRepository(OrganizationAppointmentEntity, 'read_db')
    private readonly orgAppointmentRepository: Repository<OrganizationAppointmentEntity>,
  ) {}
}
