import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationAppoinmentEntity } from '../entity/organization-appoinment.entity';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { AppoinmentsChangesHistoryEntity } from '../entity/appoinments-changes-history.entity';
import {
  CreateAppoinmentDto,
  UpdateAppoinmentDto,
} from '../dto/appoinment.dto';
import { OrganizationsEntity } from 'src/organization/entity/organization.entity';
import { ChangeHistoryDto } from '../dto/changes-history.dto';

@Injectable()
export class OrganizationAppoinmentWriteRepository {
  constructor(
    @InjectRepository(OrganizationAppoinmentEntity, 'write_db')
    private readonly orgAppoinmentRepository: Repository<OrganizationAppoinmentEntity>,
    @InjectRepository(AppoinmentsChangesHistoryEntity, 'write_db')
    private readonly historyRepository: Repository<AppoinmentsChangesHistoryEntity>,
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
      .getRepository(OrganizationAppoinmentEntity)
      .createQueryBuilder('appoinment')
      .leftJoinAndSelect('appoinment.organizations', 'organization')
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
                    'appoinment.startDate < :startDate and appoinment.endDate > :startDate',
                    { ...data },
                  );
                }),
              );
              qb2.orWhere(
                new Brackets((qb3) => {
                  qb3.where(
                    'appoinment.startDate < :endDate and appoinment.endDate > :endDate',
                    { ...data },
                  );
                }),
              );
              qb2.orWhere(
                new Brackets((qb3) => {
                  qb3.where(
                    'appoinment.startDate = :startDate and appoinment.endDate = :endDate',
                    { ...data },
                  );
                }),
              );
            }),
          );
          qb.andWhere('appoinment.softDelete = false');
        }),
      );
  }
  // It is get !
  // the reason why I put this function here is based the functionality which I call this when I have transaction
  // for create or update and I should pass queryRunner which set by the write_db datasource !
  async getConflictedAppoinmentForCreate(
    queryRunner: QueryRunner,
    data: CreateAppoinmentDto,
  ) {
    return this.confilictQueryLogic(data, queryRunner).getOne();
  }
  async getConflictedAppoinmentForUpdate(
    data: OrganizationAppoinmentEntity,
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
      .andWhere('appoinment.id != :appoinmentId', { appoinmentId: data.id })
      .getOne();
  }
  async createNewChangeHistroy(
    data: ChangeHistoryDto,
    queryRunner?: QueryRunner,
  ) {
    const historyRepository = queryRunner
      ? queryRunner.manager.getRepository(AppoinmentsChangesHistoryEntity)
      : this.historyRepository;
    const newHistory = historyRepository.create({ ...data });
    return historyRepository.save(newHistory);
  }
  async createAppoinment(
    queryRunner: QueryRunner,
    data: CreateAppoinmentDto,
    organizations: OrganizationsEntity[],
  ) {
    const newAppoinment = this.orgAppoinmentRepository.create({
      ...data,
      organizations,
    });
    return queryRunner.manager
      .getRepository(OrganizationAppoinmentEntity)
      .save(newAppoinment);
  }
  async checkAppoinmentContainsOrganization(
    organizationId: number,
    appoinmentId: number,
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager
      .getRepository(OrganizationAppoinmentEntity)
      .createQueryBuilder('appoinment')
      .leftJoinAndSelect('appoinment.organizations', 'organizations')
      .where(
        'organizations.id = :organizationId and appoinment.id = :appoinmentId',
        { appoinmentId, organizationId },
      )
      .getOne();
  }
  async deleteAppoinment(
    apponment: OrganizationAppoinmentEntity,
    queryRunner: QueryRunner,
  ) {
    apponment.softDelete = true;
    return queryRunner.manager
      .getRepository(OrganizationAppoinmentEntity)
      .save(apponment);
  }
  async getAppointmentById(id: number, queryRunner: QueryRunner) {
    return queryRunner.manager
      .getRepository(OrganizationAppoinmentEntity)
      .createQueryBuilder('appoinment')
      .leftJoinAndSelect('appoinment.organizations', 'organizations')
      .where('appoinment.id = :id', { id })
      .getOne();
  }
  async updateAppoinment(
    data: OrganizationAppoinmentEntity,
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager
      .getRepository(OrganizationAppoinmentEntity)
      .save(data);
  }
}
