import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationAppointmentEntity } from '../entity/organization-appointment.entity';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { AppointmentsChangesHistoryEntity } from '../entity/appointments-changes-history.entity';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dto/appointment.dto';
import { OrganizationsEntity } from '../../organization/entity/organization.entity';
import { ChangeHistoryDto } from '../dto/changes-history.dto';

@Injectable()
export class OrganizationAppointmentWriteRepository {
  constructor(
    @InjectRepository(OrganizationAppointmentEntity, 'write_db')
    private readonly orgAppointmentRepository: Repository<OrganizationAppointmentEntity>,
    @InjectRepository(AppointmentsChangesHistoryEntity, 'write_db')
    private readonly historyRepository: Repository<AppointmentsChangesHistoryEntity>,
  ) {}
  confilictQueryLogic(
    data: {
      creatorId: number;
      invitedId: number;
      startDate: Date;
      endDate: Date;
    },
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.organizations', 'organization')
      .where(
        new Brackets((qb) => {
          qb.where(
            new Brackets((qb1) => {
              qb1.where(
                'organization.id =:creator or organization.id = :invited',
                {
                  creator: data.creatorId,
                  invited: data.invitedId,
                },
              );
            }),
          );
          qb.andWhere(
            new Brackets((qb2) => {
              qb2.where(
                new Brackets((qb3) => {
                  qb3.where(
                    'appointment.startDate < :startDate and appointment.endDate > :startDate',
                    { ...data },
                  );
                }),
              );
              qb2.orWhere(
                new Brackets((qb3) => {
                  qb3.where(
                    'appointment.startDate < :endDate and appointment.endDate > :endDate',
                    { ...data },
                  );
                }),
              );
              qb2.orWhere(
                new Brackets((qb3) => {
                  qb3.where(
                    'appointment.startDate = :startDate and appointment.endDate = :endDate',
                    { ...data },
                  );
                }),
              );
            }),
          );
          qb.andWhere('appointment.softDelete = false');
        }),
      );
  }
  // It is get !
  // the reason why I put this function here is based the functionality which I call this when I have transaction
  // for create or update and I should pass queryRunner which set by the write_db datasource !
  async getConflictedAppointmentForCreate(
    queryRunner: QueryRunner,
    data: CreateAppointmentDto,
  ) {
    return this.confilictQueryLogic(data, queryRunner).getOne();
  }
  async getConflictedAppointmentForUpdate(
    data: OrganizationAppointmentEntity,
    queryRunner: QueryRunner,
  ) {
    return this.confilictQueryLogic(
      {
        creatorId: data.organizations[0].id,
        invitedId: data.organizations[1].id,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      queryRunner,
    )
      .andWhere('appointment.id != :appointmentId', { appointmentId: data.id })
      .getOne();
  }
  async createNewChangeHistroy(
    data: ChangeHistoryDto,
    queryRunner?: QueryRunner,
  ) {
    const historyRepository = queryRunner
      ? queryRunner.manager.getRepository(AppointmentsChangesHistoryEntity)
      : this.historyRepository;
    const newHistory = historyRepository.create({ ...data });
    return historyRepository.save(newHistory);
  }
  async createAppointment(
    queryRunner: QueryRunner,
    data: CreateAppointmentDto,
    organizations: OrganizationsEntity[],
  ) {
    const newAppointment = this.orgAppointmentRepository.create({
      ...data,
      organizations,
    });
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .save(newAppointment);
  }
  async checkAppointmentContainsOrganization(
    organizationId: number,
    appointmentId: number,
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.organizations', 'organizations')
      .where(
        'organizations.id = :organizationId and appointment.id = :appointmentId',
        { appointmentId, organizationId },
      )
      .getOne();
  }
  async deleteAppointment(
    apponment: OrganizationAppointmentEntity,
    queryRunner: QueryRunner,
  ) {
    apponment.softDelete = true;
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .save(apponment);
  }
  async getAppointmentById(id: number, queryRunner: QueryRunner) {
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.organizations', 'organizations')
      .where('appointment.id = :id', { id })
      .getOne();
  }
  async updateAppointment(
    data: OrganizationAppointmentEntity,
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager
      .getRepository(OrganizationAppointmentEntity)
      .save(data);
  }
}
