import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsEntity } from '../entity/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationWriteRepository } from './organization.write.repository';

describe('OrganizationReadRepository', () => {
  let organizationRepository: Repository<OrganizationsEntity>;
  let organizationWriteRepository: OrganizationWriteRepository;
  const repositoryToken = getRepositoryToken(OrganizationsEntity, 'write_db');
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationWriteRepository,
        {
          provide: repositoryToken,
          useValue: {
            create: jest.fn((x) => new OrganizationsEntity()),
            save: jest.fn((x) => new OrganizationsEntity()),
          },
        },
      ],
    }).compile();
    organizationRepository = moduleFixture.get(repositoryToken);
    organizationWriteRepository = moduleFixture.get(
      OrganizationWriteRepository,
    );
  });
  describe('the module is defined correctly ', () => {
    it('check organizationRepository is defined ', () => {
      expect(organizationRepository).toBeDefined();
    });
    it('check organizationWriteRepository is defined ', () => {
      expect(organizationWriteRepository).toBeDefined();
    });
  });
  describe('createOrganization function', () => {
    it('createOrganization function working correctly', async () => {
      await organizationWriteRepository.createOrganization({ name: 'test' });
      expect(organizationRepository.create).toHaveBeenCalled();
      expect(organizationRepository.save).toHaveBeenCalled();
      expect(organizationRepository.create).toHaveBeenCalledWith({
        name: 'test',
      });
    });
  });
});
