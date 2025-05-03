import { IsNotEmpty, IsArray, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { MemoryType } from '../entitys/memory.entity';

export class CreateMemoryDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  noteCardId: string;

  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  tags: string[];

  @IsEnum(MemoryType)
  @IsOptional()
  type?: MemoryType;
}
