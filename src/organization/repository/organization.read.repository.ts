import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationsEntity } from '../entity/organization.entity';
import { Brackets, FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class OrganizationReadRepository {
  constructor(
    @InjectRepository(OrganizationsEntity, 'read_db')
    private readonly organizationRepository: Repository<OrganizationsEntity>,
  ) {}
  async getOrganizationByName(name: string) {
    const organization = await this.organizationRepository.findOne({
      where: { name },
    });
    return organization;
  }
  async getAllOrganizations(from?: number, size?: number) {
    const query: FindManyOptions =
      from != undefined && size != undefined ? { take: size, skip: from } : {};
    return this.organizationRepository.findAndCount(query);
  }

  /// we can generate the schema of response with select
  /// it is defently faster due to better performance of Database
  async currenctOrganizationAppoinment(organizationId: number, date?: Date) {
    const now = date ? new Date(date) : new Date();
    return this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.appoinments', 'appoinments')
      .leftJoinAndSelect('appoinments.organizations', 'appOrganizations')
      .where(
        'appoinments.softDelete = false and organization.id = :organizationId',
        { organizationId },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('appoinments.startDate = :now', { now });
          qb.orWhere(
            new Brackets((qb2) => {
              qb2.where(
                'appoinments.startDate < :now and appoinments.endDate > :now',
                { now },
              );
            }),
          );
        }),
      )
      .getOne();
  }
  /// we can generate the schema of response with select
  /// it is defently faster due to better performance of Database
  async getAllOrganizationAppoinments(organizationId: number) {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.appoinments', 'appoinments')
      .leftJoinAndSelect('appoinments.organizations', 'appOrganizations')
      .where('organization.id = :organizationId', { organizationId })
      .getOne();
  }
}
