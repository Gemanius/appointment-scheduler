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
import { AppointmentService } from './appointment.service';
import {
  AppointmentDto,
  CreateAppointmentDto,
  GetAppointmentsDto,
  UpdateAppointmentDto,
} from './dto/appointment.dto';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationAppointmentEntity } from './entity/organization-appointment.entity';

@ApiTags('appointment')
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiResponse({ type: AppointmentDto })
  @Post()
  async createNewAppointment(@Body() data: CreateAppointmentDto) {
    if (data.creatorId == data.invitedId)
      throw new HttpException(
        'creator id and invited id should be different',
        HttpStatus.BAD_REQUEST,
      );
    return this.appointmentService.createNewAppointment(data);
  }
  @ApiResponse({ type: AppointmentDto })
  @Patch()
  async updaetAppointment(@Body() data: UpdateAppointmentDto) {
    if (!data?.endDate && !data?.startDate)
      throw new HttpException(
        'at least one of the times should update',
        HttpStatus.BAD_REQUEST,
      );
    return this.appointmentService.updateAppointment(data);
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiParam({ name: 'appointmentId', type: Number, required: true })
  @Delete('/:appointmentId/:organizationId')
  async deleteAppointment(
    @Param('appointmentId') appointmentId: number,
    @Param('organizationId') organizationId: number,
  ) {
    return this.appointmentService.deleteAppointment(
      organizationId,
      appointmentId,
    );
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiResponse({ type: [GetAppointmentsDto] })
  @Get('all/:organizationId')
  async getAllOrganizationAppointments(
    @Param('organizationId') organizationId: number,
  ) {
    return this.appointmentService.getAllOrganizationAppointments(
      organizationId,
    );
  }
  // because of not supporting auth get organizationId in param
  @ApiParam({ name: 'organizationId', type: Number, required: true })
  @ApiQuery({ name: 'date', type: Date, required: false })
  @ApiResponse({ type: GetAppointmentsDto })
  @Get('/current/:organizationId')
  async getCurrentAppointment(
    @Query('date') date: Date,
    @Param('organizationId') organizationId: number,
  ) {
    return this.appointmentService.currenctAppointment(+organizationId, date);
  }
}
