import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { NoteCardService } from '../notecards/noteCards.service';
import { MemoriesService } from '../memories/memory.service';
import { AnalyzeYoutubeDto } from '../notecards/dto/analyze-youtube.dto';
import { NoteCard } from '../notecards/entities/notecard.entity';
import { Memory } from '../memories/entitys/memory.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsPublic } from 'src/utils/decorators/isPublic.decorator';

@ApiTags('youtube-analysis')
@ApiBearerAuth()
@Controller('youtube-analysis')
export class YoutubeAnalysisController {
  constructor(
    private readonly noteCardService: NoteCardService,
    private readonly memoriesService: MemoriesService
  ) {}

  @Post(':userId')
  @IsPublic()
  @ApiOperation({ summary: 'Analyze a YouTube video and extract key ideas and memories' })
  @ApiResponse({ status: 201, description: 'The analysis has been successfully created', type: NoteCard })
  async analyzeYoutubeVideo(@Body() analyzeYoutubeDto: AnalyzeYoutubeDto, @Param('userId') userId: string): Promise<NoteCard> {
    return this.noteCardService.analyzeYoutubeVideo(analyzeYoutubeDto.youtubeUrl, userId);
  }

  @Get('note-cards/:userId')
  @ApiOperation({ summary: 'Get all note cards for the user' })
  @ApiResponse({ status: 200, type: [NoteCard] })
  async getNoteCards(@Param('userId') userId: string): Promise<NoteCard[]> {
    return this.noteCardService.findAll(userId);
  }

  @Get('note-cards/:id/:userId')
  @ApiOperation({ summary: 'Get a note card by ID' })
  @ApiResponse({ status: 200, type: NoteCard })
  async getNoteCard(@Param('id') id: string, @Param('userId') userId: string): Promise<NoteCard> {
    return this.noteCardService.findOneByUserId(id, userId);
  }

  @Get('memories/:userId')
  @ApiOperation({ summary: 'Get all memories for the user' })
  @ApiResponse({ status: 200, type: [Memory] })
  async getMemories(@Param('userId') userId: string): Promise<Memory[]> {
    return this.memoriesService.findAll(userId);
  }

  @Get('memories/by-tags/:userId')
  @ApiOperation({ summary: 'Get memories by tags' })
  @ApiResponse({ status: 200, type: [Memory] })
  async getMemoriesByTags(@Query('tags') tagsString: string, @Param('userId') userId: string): Promise<Memory[]> {
    const tags = tagsString.split(',').map((tag) => tag.trim());
    return this.memoriesService.findByTags(tags, userId);
  }

  @Get('memories/by-note-card/:noteCardId/:userId')
  @ApiOperation({ summary: 'Get memories for a specific note card' })
  @ApiResponse({ status: 200, type: [Memory] })
  async getMemoriesByNoteCard(@Param('noteCardId') noteCardId: string, @Param('userId') userId: string): Promise<Memory[]> {
    return this.memoriesService.findByNoteCard(noteCardId, userId);
  }

  @Put('note-cards/:id/like/:userId')
  @ApiOperation({ summary: 'Toggle like for a note card' })
  @ApiResponse({ status: 200, type: NoteCard })
  async toggleNoteCardLike(@Param('id') id: string, @Param('userId') userId: string): Promise<NoteCard> {
    return this.noteCardService.toggleLike(id, userId);
  }

  @Put('note-cards/:id/idea/:ideaIndex/like/:userId')
  @ApiOperation({ summary: 'Toggle like for a specific idea in a note card' })
  @ApiResponse({ status: 200, type: NoteCard })
  async toggleIdeaLike(@Param('id') id: string, @Param('ideaIndex') ideaIndex: number, @Param('userId') userId: string): Promise<NoteCard> {
    return this.noteCardService.toggleIdeaLike(id, userId, ideaIndex);
  }

  @Put('memories/:id/like/:userId')
  @ApiOperation({ summary: 'Toggle like for a memory' })
  @ApiResponse({ status: 200, type: Memory })
  async toggleMemoryLike(@Param('id') id: string, @Param('userId') userId: string): Promise<Memory> {
    return this.memoriesService.toggleLike(id, userId);
  }

  @Delete('note-cards/:id/:userId')
  @IsPublic()
  @ApiOperation({ summary: 'Delete a note card' })
  @ApiResponse({ status: 200, description: 'Note card deleted successfully' })
  async deleteNoteCard(@Param('id') id: string, @Param('userId') userId: string): Promise<void> {
    return this.noteCardService.remove(id, userId);
  }

  @Delete('memories/:id/:userId')
  @ApiOperation({ summary: 'Delete a memory' })
  @ApiResponse({ status: 200, description: 'Memory deleted successfully' })
  async deleteMemory(@Param('id') id: string, @Param('userId') userId: string): Promise<void> {
    return this.memoriesService.remove(id, userId);
  }
}
