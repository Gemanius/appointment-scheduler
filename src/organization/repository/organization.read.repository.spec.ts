import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationReadRepository } from './organization.read.repository';
import { OrganizationsEntity } from '../entity/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('OrganizationReadRepository', () => {
  let organizationRepository: Repository<OrganizationsEntity>;
  let organizationReadRepository: OrganizationReadRepository;
  const repositoryToken = getRepositoryToken(OrganizationsEntity, 'read_db');
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationReadRepository,
        {
          provide: repositoryToken,
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn((x) => {}),
          },
        },
      ],
    }).compile();
    organizationRepository = moduleFixture.get(repositoryToken);
    organizationReadRepository = moduleFixture.get(OrganizationReadRepository);
  });
  describe('the module is defined correctly ', () => {
    it('check organizationRepository is defined ', () => {
      expect(organizationRepository).toBeDefined();
    });
    it('check organizationReadRepository is defined ', () => {
      expect(organizationReadRepository).toBeDefined();
    });
  });
  describe('getOrganizationByName function ', () => {
    it('getOrganizationByName function working correctly', async () => {
      await organizationReadRepository.getOrganizationByName('test');
      expect(organizationRepository.findOne).toHaveBeenCalled();
      expect(organizationRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'test' },
      });
    });
  });
  describe('getAllOrganizations function', () => {
    it('getAllOrganizations function working correctly', async () => {
      await organizationReadRepository.getAllOrganizations();
      expect(organizationRepository.findAndCount).toHaveBeenCalled();
    });
    it('to works correctly with passing paginations arguments', async () => {
      await organizationReadRepository.getAllOrganizations(0, 10);
      expect(organizationRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });
    it('to works correctly without passing paginations arguments', async () => {
      await organizationReadRepository.getAllOrganizations();
      expect(organizationRepository.findAndCount).toHaveBeenCalledWith({});
    });
  });
});
