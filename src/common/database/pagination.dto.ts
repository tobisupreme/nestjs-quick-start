import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBase64,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SortDirection } from '../interfaces';

export class PaginationOptionsDto {
  @IsBase64()
  @IsOptional()
  cursor?: string;

  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  size?: number;

  @ApiHideProperty()
  @IsOptional()
  orderBy?: string;

  @IsEnum(SortDirection)
  @IsOptional()
  direction?: SortDirection = SortDirection.DESC;

  @ApiHideProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  paginationType?: string = 'cursor';

  @ApiHideProperty()
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  isPaginated?: string = 'true';

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  access_token?: string;
}
