import { Module } from '@nestjs/common';
import { NoteCardModule } from '../notecards/noteCards.module';
import { MemoriesModule } from '../momories/memory.module';
import { YoutubeAnalysisController } from './youtube-analysis.controller';

@Module({
  imports: [NoteCardModule, MemoriesModule],
  controllers: [YoutubeAnalysisController],
})
export class YoutubeAnalysisModule {}
