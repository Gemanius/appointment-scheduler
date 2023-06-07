import { ApiProperty } from '@nestjs/swagger';
import { ChangeHistoryEnum } from '../enum/changes-history.enum';
import { OrganizationsEntity } from 'src/organization/entity/organization.entity';
import { OrganizationAppointmentEntity } from '../entity/organization-appointment.entity';

export class ChangeHistoryDto {
  @ApiProperty({ type: ChangeHistoryEnum })
  action: ChangeHistoryEnum;
  @ApiProperty({ type: Date })
  startDate?: Date;
  @ApiProperty({ type: Date })
  endDate?: Date;
  @ApiProperty({ type: OrganizationsEntity })
  organization: OrganizationsEntity;
  @ApiProperty({ type: OrganizationAppointmentEntity })
  appointment: OrganizationAppointmentEntity;
}
