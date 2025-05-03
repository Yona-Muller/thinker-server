import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memory } from './entitys/memory.entity';
import { MemoriesService } from './memory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Memory])],
  providers: [MemoriesService],
  exports: [MemoriesService],
})
export class MemoriesModule {}
