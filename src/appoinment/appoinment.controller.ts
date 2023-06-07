/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppoinmentService } from './appoinment.service';
import {
  AppoinmentDto,
  CreateAppoinmentDto,
  GetAppoinmentsDto,
  UpdateAppoinmentDto,
} from './dto/appoinment.dto';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationAppoinmentEntity } from './entity/organization-appoinment.entity';

@ApiTags('appoinment')
@Controller('appoinment')
export class AppoinmentController {
  constructor(private readonly appoinmentService: AppoinmentService) {}

  @ApiResponse({ type: AppoinmentDto })
  @Post()
  async createNewAppoinment(@Body() data: CreateAppoinmentDto) {
    if (data.creatorId == data.invitedId)
      throw new HttpException(
        'creator id and invited id should be different',
        HttpStatus.BAD_REQUEST,
      );
    return this.appoinmentService.createNewAppoinment(data);
  }
  @ApiResponse({ type: AppoinmentDto })
  @Patch()
  async updaetAppoinment(@Body() data: UpdateAppoinmentDto) {
    if (!data?.endDate && !data?.startDate)
      throw new HttpException(
        'at least one of the times should update',
        HttpStatus.BAD_REQUEST,
      );
    return this.appoinmentService.updateAppoinment(data);
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiParam({ name: 'appoinmentId', type: Number, required: true })
  @Delete('/:appoinmentId/:organizationId')
  async deleteAppoinment(
    @Param('appoinmentId') appoinmentId: number,
    @Param('organizationId') organizationId: number,
  ) {
    return this.appoinmentService.deleteAppoinment(
      organizationId,
      appoinmentId,
    );
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiResponse({ type: [GetAppoinmentsDto] })
  @Get('all/:organizationId')
  async getAllOrganizationAppoinments(
    @Param('organizationId') organizationId: number,
  ) {
    return this.appoinmentService.getAllOrganizationAppoinments(organizationId);
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiQuery({ name: 'date', type: Date, required: false })
  @ApiResponse({ type: GetAppoinmentsDto })
  @Get('/current/:organizationId')
  async getCurrentAppoinment(
    @Query('date') date: Date,
    @Param('organizationId') organizationId: number,
  ) {
    return this.appoinmentService.currenctAppoinment(+organizationId, date);
  }
}
