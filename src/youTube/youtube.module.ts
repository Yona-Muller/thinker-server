import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
