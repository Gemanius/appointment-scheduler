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
  it('the module is defined correctly ', () => {
    expect(organizationRepository).toBeDefined();
    expect(organizationReadRepository).toBeDefined();
  });

  describe('getAllOrganizations function', () => {
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
