import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';

export class AnalyzeYoutubeDto {
  @IsUrl()
  @IsNotEmpty()
  youtubeUrl: string;
}
