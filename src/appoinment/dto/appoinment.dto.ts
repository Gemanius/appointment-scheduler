import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { OrganizationDto } from 'src/organization/dto/organization.dto';

export class AppoinmentDto {
  @ApiProperty({ type: Number })
  id?: number;
  @ApiProperty({ type: Date })
  startDate: Date;
  @ApiProperty({ type: Date })
  endDate: Date;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
}

export class CreateAppoinmentDto implements AppoinmentDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  creatorId: number;
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  invitedId: number;
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  startDate: Date;
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ type: Date })
  endDate: Date;
}
export class UpdateAppoinmentDto implements AppoinmentDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  updatorId: number;
  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: Date })
  startDate: Date;
  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: Date })
  endDate: Date;
}
export class GetAppoinmentsDto extends AppoinmentDto {
  @ApiProperty({ type: OrganizationDto })
  with: OrganizationDto;
}
