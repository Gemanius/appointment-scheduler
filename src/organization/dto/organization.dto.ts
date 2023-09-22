import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class OrganizationDto {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  image?: string;
}

export class CreateOrganizationDto implements OrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({ type: String })
  name: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(30)
  @ApiProperty({ type: String })
  email: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  image?: string;
}
export class GetAllOrganizations {
  @ApiProperty({ type: [OrganizationDto] })
  organizations: OrganizationDto[];
  @ApiProperty({ type: Number })
  count: number;
}
