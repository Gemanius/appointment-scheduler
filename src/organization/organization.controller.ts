/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  GetAllOrganizations,
  OrganizationDto,
} from './dto/organization.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiCreatedResponse({ type: OrganizationDto })
  @ApiBadRequestResponse({ type: HttpException })
  @Post('create')
  async createOrganization(@Body() data: CreateOrganizationDto) {
    console.log(data);
    return this.organizationService.createOrganization(data);
  }

  @ApiQuery({ name: 'from', type: Number, required: false })
  @ApiQuery({ name: 'size', type: Number, required: false })
  @ApiOkResponse({ type: GetAllOrganizations })
  @Get('all')
  async getAllOrganizations(
    @Query('from') from: number,
    @Query('size') size: number,
  ) {
    return this.organizationService.getAllOrganizations(from, size);
  }
}
