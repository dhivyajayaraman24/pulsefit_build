import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsObject, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { MemberProfileStatus } from '../entities';

export class CreateMemberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  homeBranchId!: string;

  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  lastName!: string;

  @ApiPropertyOptional({ format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ minLength: 7, maxLength: 32 })
  @IsString()
  @Length(7, 32)
  phone!: string;

  @ApiPropertyOptional({ enum: MemberProfileStatus, default: MemberProfileStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MemberProfileStatus)
  status?: MemberProfileStatus;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @ApiPropertyOptional({ format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ minLength: 7, maxLength: 32 })
  @IsOptional()
  @IsString()
  @Length(7, 32)
  phone?: string | null;

  @ApiPropertyOptional({ enum: MemberProfileStatus })
  @IsOptional()
  @IsEnum(MemberProfileStatus)
  status?: MemberProfileStatus;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
