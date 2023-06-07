import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { OrganizationWriteRepository } from '../organization/repository/organization.write.repository';
import { OrganizationReadRepository } from '../organization/repository/organization.read.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OrganizationAppointmentWriteRepository } from './repository/appoinment.write.repository';
import { HttpException } from '@nestjs/common';
import { OrganizationAppointmentEntity } from './entity/organization-appointment.entity';
import { OrganizationsEntity } from '../organization/entity/organization.entity';

describe('Appointment Service', () => {
  let orgAppointmentWriteRepository: OrganizationAppointmentWriteRepository;
  let appointmentService: AppointmentService;
  let organizationWriteRepository: OrganizationWriteRepository;
  let organizationReadRepository: OrganizationReadRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const dataSourceToken = getDataSourceToken('write_db');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: OrganizationWriteRepository,
          useValue: {
            getOrganizationsById: jest.fn(),
          },
        },
        {
          provide: OrganizationReadRepository,
          useValue: {},
        },
        {
          provide: dataSourceToken,
          useValue: {
            createQueryRunner: jest.fn(() => ({
              release: jest.fn(),
              connect: jest.fn(),
              startTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              commitTransaction: jest.fn(),
            })),
          },
        },
        {
          provide: OrganizationAppointmentWriteRepository,
          useValue: {
            getConflictedAppointmentForCreate: jest.fn(),
            createAppointment: jest.fn(),
            createNewChangeHistroy: jest.fn(),
            getAppointmentById: jest.fn(),
            getConflictedAppointmentForUpdate: jest.fn(),
            updateAppointment: jest.fn(),
            checkAppointmentContainsOrganization: jest.fn(),
            deleteAppointment: jest.fn(),
          },
        },
      ],
    }).compile();
    appointmentService = moduleFixture.get(AppointmentService);
    orgAppointmentWriteRepository = moduleFixture.get(
      OrganizationAppointmentWriteRepository,
    );
    organizationReadRepository = moduleFixture.get(OrganizationReadRepository);
    organizationWriteRepository = moduleFixture.get(
      OrganizationWriteRepository,
    );
    dataSource = moduleFixture.get(dataSourceToken);

    jest
      .spyOn(appointmentService, 'setQueryRunner')
      .mockImplementation(jest.fn())
      .mockResolvedValue({
        connect: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      } as unknown as QueryRunner);
  });
  it('should be initilized correctly ', () => {
    expect(appointmentService).toBeDefined();
    expect(orgAppointmentWriteRepository).toBeDefined();
    expect(organizationReadRepository).toBeDefined();
    expect(organizationWriteRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });
  describe('createNewAppointment Function', () => {
    it('should return error if organizations does not exist', async () => {
      jest
        .spyOn(organizationWriteRepository, 'getOrganizationsById')
        .mockResolvedValue([]);
      try {
        await appointmentService.createNewAppointment({
          creatorId: 1,
          invitedId: 2,
          startDate: new Date(),
          endDate: new Date(),
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should return error if appointments has confilicts ', async () => {
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'getConflictedAppointmentForCreate',
        )
        .mockResolvedValue(new OrganizationAppointmentEntity());
      jest
        .spyOn(organizationWriteRepository, 'getOrganizationsById')
        .mockResolvedValue([
          new OrganizationsEntity(),
          new OrganizationsEntity(),
        ]);
      try {
        await appointmentService.createNewAppointment({
          creatorId: 1,
          invitedId: 2,
          startDate: new Date(),
          endDate: new Date(),
        });
      } catch (e) {
        console.log(e);
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should call orgAppointmentWriteRepository.createAppointment ', async () => {
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'getConflictedAppointmentForCreate',
        )
        .mockResolvedValue(null);
      jest
        .spyOn(organizationWriteRepository, 'getOrganizationsById')
        .mockResolvedValue([
          new OrganizationsEntity(),
          new OrganizationsEntity(),
        ]);
      jest
        .spyOn(orgAppointmentWriteRepository, 'createAppointment')
        .mockResolvedValue(new OrganizationAppointmentEntity());
      await appointmentService.createNewAppointment({
        creatorId: 1,
        invitedId: 2,
        startDate: new Date(),
        endDate: new Date(),
      });
      expect(
        orgAppointmentWriteRepository.createAppointment,
      ).toHaveBeenCalled();
      expect(
        orgAppointmentWriteRepository.createNewChangeHistroy,
      ).toHaveBeenCalled();
      expect(
        (await appointmentService.setQueryRunner()).commitTransaction,
      ).toHaveBeenCalled();
    });
  });
  describe('updateAppointment Function', () => {
    it('should throw error if appointment id is incorrect', async () => {
      jest
        .spyOn(orgAppointmentWriteRepository, 'getAppointmentById')
        .mockResolvedValue(null);
      try {
        await appointmentService.updateAppointment({
          endDate: new Date(),
          id: 1,
          updaterId: 1,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should throw error if organization is not an appointment participant', async () => {
      jest
        .spyOn(orgAppointmentWriteRepository, 'getAppointmentById')
        .mockImplementation(async (x, y) => {
          return {
            organizations: [
              {
                id: 2,
              },
              {
                id: 3,
              },
            ],
          } as unknown as OrganizationAppointmentEntity;
        });
      try {
        await appointmentService.updateAppointment({
          endDate: new Date(),
          id: 1,
          updaterId: 1,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should throw error if organization its dates are confilicted with other appointment', async () => {
      jest
        .spyOn(orgAppointmentWriteRepository, 'getAppointmentById')
        .mockResolvedValue({
          organizations: [
            {
              id: 1,
            },
            {
              id: 3,
            },
          ],
        } as unknown as OrganizationAppointmentEntity);
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'getConflictedAppointmentForUpdate',
        )
        .mockResolvedValue(new OrganizationAppointmentEntity());
      try {
        await appointmentService.updateAppointment({
          endDate: new Date(),
          id: 1,
          updaterId: 1,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should call orgAppointmentWriteRepository.updateAppointment and insert history and commit the transaction', async () => {
      jest
        .spyOn(orgAppointmentWriteRepository, 'getAppointmentById')
        .mockResolvedValue({
          organizations: [
            {
              id: 1,
            },
            {
              id: 3,
            },
          ],
        } as unknown as OrganizationAppointmentEntity);
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'getConflictedAppointmentForUpdate',
        )
        .mockResolvedValue(null);
      jest
        .spyOn(orgAppointmentWriteRepository, 'updateAppointment')
        .mockResolvedValue(new OrganizationAppointmentEntity());
      await appointmentService.updateAppointment({
        endDate: new Date(),
        id: 1,
        updaterId: 1,
      });
      expect(
        orgAppointmentWriteRepository.updateAppointment,
      ).toHaveBeenCalled();
      expect(
        orgAppointmentWriteRepository.createNewChangeHistroy,
      ).toHaveBeenCalled();
      expect(
        (await appointmentService.setQueryRunner()).commitTransaction,
      ).toHaveBeenCalled();
    });
  });
  describe('deleteAppointment Function', () => {
    it(' should return error if organization is not participate in appointment ', async () => {
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'checkAppointmentContainsOrganization',
        )
        .mockResolvedValue(null);
      try {
        await appointmentService.deleteAppointment(1, 1);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it(' should call deleteAppointment and insert in history ', async () => {
      jest
        .spyOn(
          orgAppointmentWriteRepository,
          'checkAppointmentContainsOrganization',
        )
        .mockResolvedValue({
          organizations: [1, 2],
        } as unknown as OrganizationAppointmentEntity);
      await appointmentService.deleteAppointment(1, 1);
      expect(
        orgAppointmentWriteRepository.deleteAppointment,
      ).toHaveBeenCalled();
      expect(
        orgAppointmentWriteRepository.createNewChangeHistroy,
      ).toHaveBeenCalled();
    });
  });
});
