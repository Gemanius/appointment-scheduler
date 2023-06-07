/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  CreateAppointmentDto,
  GetAppointmentsDto,
  UpdateAppointmentDto,
} from './dto/appointment.dto';
import { OrganizationWriteRepository } from '../organization/repository/organization.write.repository';
import { ChangeHistoryDto } from './dto/changes-history.dto';
import { ChangeHistoryEnum } from './enum/changes-history.enum';
import { OrganizationAppointmentEntity } from './entity/organization-appointment.entity';
import { OrganizationReadRepository } from '../organization/repository/organization.read.repository';
import { OrganizationAppointmentWriteRepository } from './repository/appoinment.write.repository';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly orgAppointmentWriteRepository: OrganizationAppointmentWriteRepository,
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
  async createNewAppointment(data: CreateAppointmentDto) {
    const queryRunner = await this.setQueryRunner();
    try {
      const appointmentOrganization =
        await this.organizationWriteRepository.getOrganizationsById(
          queryRunner,
          [data.invitedId, data.creatorId],
        );
      if (appointmentOrganization.length < 2)
        throw new HttpException(
          'invited or creator organiztions id is wrong',
          HttpStatus.BAD_REQUEST,
        );
      const doesConfilict =
        await this.orgAppointmentWriteRepository.getConflictedAppointmentForCreate(
          queryRunner,
          data,
        );
      if (doesConfilict)
        throw new HttpException(
          'the appointment confilicts with other one in one of side',
          HttpStatus.BAD_REQUEST,
        );

      const result = await this.orgAppointmentWriteRepository.createAppointment(
        queryRunner,
        data,
        appointmentOrganization,
      );

      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.create;
      newHistory.startDate = data.startDate;
      newHistory.endDate = data.endDate;
      newHistory.appointment = result;
      newHistory.organization = appointmentOrganization.find(
        (elem) => elem.id == data.creatorId,
      );

      const { softDelete, history, organizations, ...appointmentData } = result;
      await this.orgAppointmentWriteRepository.createNewChangeHistroy(
        newHistory,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return appointmentData;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  async updateAppointment(data: UpdateAppointmentDto) {
    const queryRunner = await this.setQueryRunner();
    try {
      const appointment =
        await this.orgAppointmentWriteRepository.getAppointmentById(
          data.id,
          queryRunner,
        );
      if (!appointment)
        throw new HttpException(
          'the appointment id is incorrect',
          HttpStatus.NOT_FOUND,
        );
      const isAppointmentBelongsToOrganization = appointment.organizations.find(
        (elem) => elem.id == data.updaterId,
      );
      if (!isAppointmentBelongsToOrganization)
        throw new HttpException(
          'only the organization of appointment can update it',
          HttpStatus.FORBIDDEN,
        );
      appointment.startDate = data?.startDate
        ? data.startDate
        : appointment.startDate;
      appointment.endDate = data?.endDate ? data.endDate : appointment.endDate;
      const doesConfilict =
        await this.orgAppointmentWriteRepository.getConflictedAppointmentForUpdate(
          appointment,
          queryRunner,
        );
      if (doesConfilict)
        throw new HttpException(
          'the appointment confilicts with other one in one of side',
          HttpStatus.BAD_REQUEST,
        );
      const result = await this.orgAppointmentWriteRepository.updateAppointment(
        appointment,
        queryRunner,
      );

      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.update;
      newHistory.organization = isAppointmentBelongsToOrganization;
      newHistory.startDate = data?.startDate ? data.startDate : null;
      newHistory.endDate = data?.endDate ? data.endDate : null;
      newHistory.appointment = appointment;
      const { softDelete, history, organizations, ...appointmentData } = result;
      await this.orgAppointmentWriteRepository.createNewChangeHistroy(
        newHistory,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return appointmentData;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  async deleteAppointment(organizationId: number, appointmentId: number) {
    const queryRunner = await this.setQueryRunner();
    try {
      const checkedAppointment: OrganizationAppointmentEntity =
        await this.orgAppointmentWriteRepository.checkAppointmentContainsOrganization(
          organizationId,
          appointmentId,
          queryRunner,
        );
      if (!checkedAppointment || checkedAppointment.organizations.length == 0)
        throw new HttpException(
          'only organizations in the appointment can delete',
          HttpStatus.FORBIDDEN,
        );
      await this.orgAppointmentWriteRepository.deleteAppointment(
        checkedAppointment,
        queryRunner,
      );
      const newHistory = new ChangeHistoryDto();
      newHistory.action = ChangeHistoryEnum.delete;
      newHistory.appointment = checkedAppointment;
      newHistory.organization = checkedAppointment.organizations[0];
      await this.orgAppointmentWriteRepository.createNewChangeHistroy(
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
  async getAllOrganizationAppointments(
    organizationId: number,
  ): Promise<GetAppointmentsDto[]> {
    const result =
      await this.organizationReadRepository.getAllOrganizationAppointments(
        organizationId,
      );
    if (!result)
      throw new HttpException('organization not found', HttpStatus.NOT_FOUND);
    const finalResponse = result?.appointments.map((elem) => {
      const { softDelete, history, organizations, ...restData } = elem;

      return {
        with: organizations.find((elem) => elem.id != organizationId),
        ...restData,
      };
    });
    return finalResponse;
  }
  async currenctAppointment(
    organizationId: number,
    date?: Date,
  ): Promise<GetAppointmentsDto> {
    const result =
      await this.organizationReadRepository.currenctOrganizationAppointment(
        organizationId,
        date,
      );
    if (!result)
      throw new HttpException('appointment not found', HttpStatus.NOT_FOUND);
    const { organizations, ...restData } = result.appointments[0];
    return {
      with: organizations.find((elem) => elem.id != organizationId),
      ...restData,
    };
  }
}
