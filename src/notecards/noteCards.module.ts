import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteCard } from './entities/notecard.entity';
import { NoteCardService } from './noteCards.service';
import { YoutubeModule } from '../youTube/youtube.module';
import { AIModule } from '../ai/ai.module';
import { MemoriesModule } from '../momories/memory.module';

@Module({
  imports: [TypeOrmModule.forFeature([NoteCard]), YoutubeModule, AIModule, MemoriesModule],
  providers: [NoteCardService],
  exports: [NoteCardService],
})
export class NoteCardModule {}
