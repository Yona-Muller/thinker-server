import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import * as ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

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

  extractVideoId(url: string): string {
    try {
      const videoId = ytdl.getVideoID(url);
      return videoId;
    } catch (error) {
      throw new HttpException('Invalid YouTube URL', HttpStatus.BAD_REQUEST);
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const videoId = this.extractVideoId(url);
      const apiKey = 'AIzaSyBkXJ0uOI81nnzpjiMzuacPHKwpGVGuf9k';

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
      const response = await axios.get(apiUrl);

      const videoData = response.data.items[0];
      if (!videoData) {
        throw new Error('Video not found or API limit exceeded');
      }

      const { title, channelTitle, thumbnails } = videoData.snippet;
      const thumbnailUrl = thumbnails?.high?.url || thumbnails?.default?.url || '';

      const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${videoData.snippet.channelId}&key=${apiKey}`;
      const channelResponse = await axios.get(channelApiUrl);
      const channelAvatar = channelResponse.data.items[0]?.snippet?.thumbnails?.default?.url || '';

      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
      const transcript = transcriptArray.map((item) => item.text).join(' ');

      return {
        title,
        channelName: channelTitle,
        channelAvatar,
        thumbnailUrl,
        transcript,
        videoId,
      };
    } catch (error) {
      throw new HttpException(`Failed to fetch video information: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
