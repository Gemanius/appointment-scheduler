import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class OrganizationDto {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  name: string;
}

export class CreateOrganizationDto implements OrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({ type: String })
  name: string;
}
export class GetAllOrganizations {
  @ApiProperty({ type: [OrganizationDto] })
  organizations: OrganizationDto[];
  @ApiProperty({ type: Number })
  count: number;
}
