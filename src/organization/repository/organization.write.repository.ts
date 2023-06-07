import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationsEntity } from '../entity/organization.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateOrganizationDto } from '../dto/organization.dto';

@Injectable()
export class OrganizationWriteRepository {
  constructor(
    @InjectRepository(OrganizationsEntity, 'write_db')
    private readonly organizationRepository: Repository<OrganizationsEntity>,
  ) {}
  async createOrganization(data: CreateOrganizationDto) {
    const newOrganization = this.organizationRepository.create({ ...data });
    return this.organizationRepository.save(newOrganization);
  }
  async getOrganizationsById(queryRunner: QueryRunner, ids: number[]) {
    return queryRunner.manager.getRepository(OrganizationsEntity).find({
      where: ids.map((elem) => ({ id: elem })),
    });
  }
}
