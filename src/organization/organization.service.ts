/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrganizationWriteRepository } from './repository/organization.write.repository';
import { OrganizationReadRepository } from './repository/organization.read.repository';
import {
  CreateOrganizationDto,
  GetAllOrganizations,
} from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationWriteRepository: OrganizationWriteRepository,
    private readonly organizationReadRepository: OrganizationReadRepository,
  ) {}
  async createOrganization(data: CreateOrganizationDto) {
    const isOtherOrganizationExist =
      await this.organizationReadRepository.getOrganizationByEmail(data.email);
    if (isOtherOrganizationExist)
      throw new HttpException(
        'other user exist with this name',
        HttpStatus.BAD_REQUEST,
      );
    const organization =
      await this.organizationWriteRepository.createOrganization(data);
    return organization;
  }
  async getAllOrganizations(
    from?: number,
    size?: number,
  ): Promise<GetAllOrganizations> {
    const [organizations, count] =
      await this.organizationReadRepository.getAllOrganizations(from, size);

    return {
      organizations,
      count,
    };
  }
}
