import { ApiProperty } from '@nestjs/swagger';
import { ChangeHistoryEnum } from '../enum/changes-history.enum';
import { OrganizationDto } from '../../organization/dto/organization.dto';
import { AppointmentDto } from './appointment.dto';

export class ChangeHistoryDto {
  @ApiProperty({ type: ChangeHistoryEnum })
  action: ChangeHistoryEnum;
  @ApiProperty({ type: Date })
  startDate?: Date;
  @ApiProperty({ type: Date })
  endDate?: Date;
  @ApiProperty({ type: OrganizationDto })
  organization: OrganizationDto;
  @ApiProperty({ type: AppointmentDto })
  appointment: AppointmentDto;
}
