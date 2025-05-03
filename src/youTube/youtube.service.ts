import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import * as ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';

interface VideoInfo {
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  transcript: string;
  videoId: string;
}

@Injectable()
export class YoutubeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Extract YouTube video ID from URL
   */
  extractVideoId(url: string): string {
    try {
      const videoId = ytdl.getVideoID(url);
      return videoId;
    } catch (error) {
      throw new HttpException('Invalid YouTube URL', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get detailed information about a YouTube video
   */
  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const videoId = this.extractVideoId(url);

      // Get video details using ytdl-core
      const videoInfo = await ytdl.getInfo(videoId);

      // Extract transcript using youtube-transcript package
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
      const transcript = transcriptArray.map((item) => item.text).join(' ');

      // Extract video metadata
      const title = videoInfo.videoDetails.title;
      const channelName = videoInfo.videoDetails.author.name;
      const channelAvatar = videoInfo.videoDetails.author.thumbnails?.[0]?.url || '';
      const thumbnailUrl = videoInfo.videoDetails.thumbnails[0]?.url || '';

      return {
        title,
        channelName,
        channelAvatar,
        thumbnailUrl,
        transcript,
        videoId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to fetch video information: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
