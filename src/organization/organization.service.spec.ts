import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationReadRepository } from './repository/organization.read.repository';
import { OrganizationWriteRepository } from './repository/organization.write.repository';
import { OrganizationsEntity } from './entity/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { HttpException } from '@nestjs/common';
import { GetAllOrganizations } from './dto/organization.dto';

describe('Organization Service', () => {
  let organizationReadRepository: OrganizationReadRepository;
  let organizationWriteRepository: OrganizationWriteRepository;
  let organizationService: OrganizationService;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationReadRepository,
          useValue: {
            getOrganizationByName: jest.fn((x) => x),
            getAllOrganizations: jest.fn((x) => x),
          },
        },
        {
          provide: OrganizationWriteRepository,
          useValue: {
            createOrganization: jest.fn(() => new OrganizationsEntity()),
          },
        },
      ],
    }).compile();

    organizationReadRepository = moduleFixture.get(OrganizationReadRepository);
    organizationWriteRepository = moduleFixture.get(
      OrganizationWriteRepository,
    );
    organizationService = moduleFixture.get(OrganizationService);
  });
  describe('module defined correctly', () => {
    it('organizationWriteRepository should be defined', () => {
      expect(organizationWriteRepository).toBeDefined();
    });
    it('organizationReadRepository should be defined', () => {
      expect(organizationReadRepository).toBeDefined();
    });
    it('organizationService is defined correctly', () => {
      expect(organizationService).toBeDefined();
    });
  });
  describe('createOrganization function', () => {
    it('expect to call organization.getOrganizationByName ', async () => {
      try {
        await organizationService.createOrganization({ name: 'test' });
      } catch {}
      expect(
        organizationReadRepository.getOrganizationByName,
      ).toHaveBeenCalled();
    });
    it('expect to organizationService.create throw and 400 error with existing organization with same name', async () => {
      jest
        .spyOn(organizationReadRepository, 'getOrganizationByName')
        .mockResolvedValueOnce(new OrganizationsEntity());
      try {
        await organizationService.createOrganization({
          name: 'test',
        });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
      }
    });
    it('expect to organizationWriteRepository.create have been called ', async () => {
      jest
        .spyOn(organizationReadRepository, 'getOrganizationByName')
        .mockResolvedValueOnce(null);

      await organizationService.createOrganization({
        name: 'test',
      });
      expect(organizationWriteRepository.createOrganization).toHaveBeenCalled();
    });
    it('expect to organizationService.create create a organization ', async () => {
      jest
        .spyOn(organizationReadRepository, 'getOrganizationByName')
        .mockResolvedValueOnce(null);

      const result = await organizationService.createOrganization({
        name: 'test',
      });
      expect(result).toBeInstanceOf(OrganizationsEntity);
    });
  });
  describe('getAllOrganizations', () => {
    const date = new Date();
    beforeEach(() => {
      jest
        .spyOn(organizationReadRepository, 'getAllOrganizations')
        .mockResolvedValue([
          [
            {
              id: 1,
              name: 'test',
              createdAt: date,
              updatedAt: date,
            },
          ],
          1,
        ]);
    });
    it('call organizationReadRepository.getAllOrganizations', async () => {
      await organizationService.getAllOrganizations();
      expect(organizationReadRepository.getAllOrganizations).toHaveBeenCalled();
    });
    it('return correct output', async () => {
      const result = await organizationService.getAllOrganizations(null, null);
      expect(result).toEqual({
        organizations: [
          {
            id: 1,
            name: 'test',
            createdAt: date,
            updatedAt: date,
          },
        ],
        count: 1,
      });
    });
  });
});
