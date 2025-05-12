import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteCard } from './entities/notecard.entity';
import { NoteCardService } from './noteCards.service';
import { YoutubeModule } from '../youTube/youtube.module';
import { AIModule } from '../ai/ai.module';
import { MemoriesModule } from '../memories/memory.module';
import { NoteCardsController } from './noteCards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteCard]), YoutubeModule, AIModule, MemoriesModule],
  controllers: [NoteCardsController],
  providers: [NoteCardService],
  exports: [NoteCardService],
})
export class NoteCardModule {}
