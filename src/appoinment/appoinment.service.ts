/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { OrganizationAppoinmentWriteRepository } from './repository/appoinment.write.repository';
import {
  CreateAppoinmentDto,
  GetAppoinmentsDto,
  UpdateAppoinmentDto,
} from './dto/appoinment.dto';
import { OrganizationWriteRepository } from 'src/organization/repository/organization.write.repository';
import { ChangeHistoryDto } from './dto/changes-history.dto';
import { ChangeHistoryEnum } from './enum/changes-history.enum';
import { OrganizationAppoinmentEntity } from './entity/organization-appoinment.entity';
import { OrganizationReadRepository } from 'src/organization/repository/organization.read.repository';

@Injectable()
export class AppoinmentService {
  constructor(
    private readonly orgAppoinmentWriteRepository: OrganizationAppoinmentWriteRepository,
    private readonly organizationWriteRepository: OrganizationWriteRepository,
    private readonly organizationReadRepository: OrganizationReadRepository,
    @InjectDataSource('write_db')
    private readonly dataSource: DataSource,
  ) {}
  async setQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }
  async createNewAppoinment(data: CreateAppoinmentDto) {
    const queryRunner = await this.setQueryRunner();
    try {
      const appoinmentOrganization =
        await this.organizationWriteRepository.getOrganizationsById(
          queryRunner,
          [data.invitedId, data.creatorId],
        );
      if (appoinmentOrganization.length < 2)
        throw new HttpException(
          'invited or creator organiztions id is wrong',
          HttpStatus.BAD_REQUEST,
        );
      const doesConfilict =
        await this.orgAppoinmentWriteRepository.getConflictedAppoinmentForCreate(
          queryRunner,
          data,
        );
      if (doesConfilict)
        throw new HttpException(
          'the appoinment confilicts with other one in one of side',
          HttpStatus.BAD_REQUEST,
        );

      const result = await this.orgAppoinmentWriteRepository.createAppoinment(
        queryRunner,
        data,
        appoinmentOrganization,
      );

      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.create;
      newHistory.startDate = data.startDate;
      newHistory.endDate = data.endDate;
      newHistory.appoinment = result;
      newHistory.organization = appoinmentOrganization.find(
        (elem) => elem.id == data.creatorId,
      );

      const { softDelete, history, organizations, ...appoinmentData } = result;
      await this.orgAppoinmentWriteRepository.createNewChangeHistroy(
        newHistory,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return appoinmentData;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  async updateAppoinment(data: UpdateAppoinmentDto) {
    const queryRunner = await this.setQueryRunner();
    try {
      const appoinment =
        await this.orgAppoinmentWriteRepository.getAppointmentById(
          data.id,
          queryRunner,
        );
      const isAppoinmentBelongsToOrganization = appoinment.organizations.find(
        (elem) => elem.id == data.updatorId,
      );
      if (!isAppoinmentBelongsToOrganization)
        throw new HttpException(
          'only the organization of appoinment can update it',
          HttpStatus.FORBIDDEN,
        );
      appoinment.startDate = data?.startDate
        ? data.startDate
        : appoinment.startDate;
      appoinment.endDate = data?.endDate ? data.endDate : appoinment.endDate;
      const doesConfilict =
        await this.orgAppoinmentWriteRepository.getConflictedAppoinmentForUpdate(
          appoinment,
          queryRunner,
        );
      if (doesConfilict)
        throw new HttpException(
          'the appoinment confilicts with other one in one of side',
          HttpStatus.BAD_REQUEST,
        );
      const result = await this.orgAppoinmentWriteRepository.updateAppoinment(
        appoinment,
        queryRunner,
      );

      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.update;
      newHistory.organization = isAppoinmentBelongsToOrganization;
      newHistory.startDate = data?.startDate ? data.startDate : null;
      newHistory.endDate = data?.endDate ? data.endDate : null;
      newHistory.appoinment = appoinment;
      const { softDelete, history, organizations, ...appoinmentData } = result;
      await this.orgAppoinmentWriteRepository.createNewChangeHistroy(
        newHistory,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return appoinmentData;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  async deleteAppoinment(organizationId: number, appoinmentId: number) {
    const queryRunner = await this.setQueryRunner();
    try {
      const checkedAppoinment: OrganizationAppoinmentEntity =
        await this.orgAppoinmentWriteRepository.checkAppoinmentContainsOrganization(
          organizationId,
          appoinmentId,
          queryRunner,
        );
      if (!checkedAppoinment || checkedAppoinment.organizations.length == 0)
        throw new HttpException(
          'only organizations in the appoinment can delete',
          HttpStatus.FORBIDDEN,
        );
      await this.orgAppoinmentWriteRepository.deleteAppoinment(
        checkedAppoinment,
        queryRunner,
      );
      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.delete;
      newHistory.appoinment = checkedAppoinment;
      newHistory.organization = checkedAppoinment.organizations[0];
      await this.orgAppoinmentWriteRepository.createNewChangeHistroy(
        newHistory,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  organizationAppoinmentSchemaGenerator(
    data: [OrganizationAppoinmentEntity[], number],
    organizationId: number,
  ) {
    const appoinments = data[0].map((elem) => {
      const { softDelete, history, organizations, ...restData } = elem;
      return {
        ...restData,
        organization: organizations.find((elem2) => elem2.id != organizationId),
      };
    });
    return {
      appoinments,
      count: data[1],
    };
  }
  async getAllOrganizationAppoinments(
    organizationId: number,
  ): Promise<GetAppoinmentsDto[]> {
    const result =
      await this.organizationReadRepository.getAllOrganizationAppoinments(
        organizationId,
      );
    if (!result)
      throw new HttpException('organization not found', HttpStatus.NOT_FOUND);
    const finalResponse = result?.appoinments.map((elem) => {
      const { softDelete, history, organizations, ...restData } = elem;

      return {
        with: organizations.find((elem) => elem.id != organizationId),
        ...restData,
      };
    });
    return finalResponse;
  }
  async currenctAppoinment(
    organizationId: number,
    date?: Date,
  ): Promise<GetAppoinmentsDto> {
    const result =
      await this.organizationReadRepository.currenctOrganizationAppoinment(
        organizationId,
        date,
      );
    if (!result)
      throw new HttpException('appoinment not found', HttpStatus.NOT_FOUND);
    const { organizations, ...restData } = result.appoinments[0];
    return {
      with: organizations.find((elem) => elem.id != organizationId),
      ...restData,
    };
  }
}
