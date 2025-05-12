import { PartialType } from '@nestjs/swagger';
import { CreateMemoryDto } from './create-memory.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMemoryDto extends PartialType(CreateMemoryDto) {
  @IsBoolean()
  @IsOptional()
  isLiked?: boolean;
}
