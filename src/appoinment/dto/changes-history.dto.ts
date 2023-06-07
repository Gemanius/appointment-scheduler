import { ApiProperty } from '@nestjs/swagger';
import { ChangeHistoryEnum } from '../enum/changes-history.enum';
import { OrganizationsEntity } from 'src/organization/entity/organization.entity';
import { OrganizationAppoinmentEntity } from '../entity/organization-appoinment.entity';

export class ChangeHistoryDto {
  @ApiProperty({ type: ChangeHistoryEnum })
  action: ChangeHistoryEnum;
  @ApiProperty({ type: Date })
  startDate?: Date;
  @ApiProperty({ type: Date })
  endDate?: Date;
  @ApiProperty({ type: OrganizationsEntity })
  organization: OrganizationsEntity;
  @ApiProperty({ type: OrganizationAppoinmentEntity })
  appoinment: OrganizationAppoinmentEntity;
}
