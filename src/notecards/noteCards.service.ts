import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteCard, CardType, NoteCardType } from './entities/notecard.entity';
import { CreateNoteCardDto } from './dto/create-notecerd.dto';
import { YoutubeService } from '../youTube/youtube.service';
import { AIService } from '../ai/ai.service';
import { MemoriesService } from '../memories/memory.service';

@Injectable()
export class NoteCardService {
  constructor(
    @InjectRepository(NoteCard)
    private noteCardRepository: Repository<NoteCard>,
    private youtubeService: YoutubeService,
    private aiService: AIService,
    private memoriesService: MemoriesService
  ) {}

  async create(createNoteCardDto: CreateNoteCardDto): Promise<NoteCard> {
    const noteCard = this.noteCardRepository.create({
      ...createNoteCardDto,
      isIdeaLiked: new Array(createNoteCardDto.keyTakeaways?.length || 0).fill(false),
    });
    return await this.noteCardRepository.save(noteCard);
  }

  async findAll(userId: string): Promise<NoteCard[]> {
    return this.noteCardRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByUserId(id: string, userId: string): Promise<NoteCard> {
    const noteCard = await this.noteCardRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!noteCard) {
      throw new NotFoundException(`Note card with ID ${id} not found (in user ${userId})`);
    }

    return noteCard;
  }

  async findOne(id: string): Promise<NoteCard> {
    const noteCard = await this.noteCardRepository.findOne({
      where: { id, isActive: true },
    });

    if (!noteCard) {
      throw new NotFoundException(`Note card with ID ${id} not found`);
    }

    return noteCard;
  }

  async analyzeYoutubeVideo(youtubeUrl: string, userId: string): Promise<NoteCard> {
    const videoInfo = await this.youtubeService.getVideoInfo(youtubeUrl);

    const aiAnalysis = await this.aiService.analyzeTranscript(videoInfo.transcript, videoInfo.title);

    const noteCard = await this.create({
      title: videoInfo.title,
      sourceUrl: youtubeUrl,
      sourceType: NoteCardType.YOUTUBE,
      type: CardType.NOTE_CARD,
      keyTakeaways: aiAnalysis.keyIdeas.map((idea) => `${idea.title}: ${idea.content}`),
      tags: aiAnalysis.categories,
      thumbnailUrl: videoInfo.thumbnailUrl,
      channelName: videoInfo.channelName,
      channelAvatar: videoInfo.channelAvatar,
      userId,
    });

    const memories = aiAnalysis.memories.map((memory) => ({
      userId,
      noteCardId: noteCard.id,
      content: memory.content,
      tags: memory.tags,
    }));

    await Promise.all(memories.map((memory) => this.memoriesService.create(memory)));

    return noteCard;
  }

  async toggleLike(id: string, userId: string): Promise<NoteCard> {
    const noteCard = await this.findOneByUserId(id, userId);
    noteCard.isLiked = !noteCard.isLiked;
    return this.noteCardRepository.save(noteCard);
  }

  async toggleIdeaLike(id: string, userId: string, ideaIndex: number): Promise<NoteCard> {
    const noteCard = await this.findOneByUserId(id, userId);

    if (ideaIndex < 0 || ideaIndex >= noteCard.keyTakeaways.length) {
      throw new NotFoundException(`Idea index ${ideaIndex} out of bounds`);
    }

    if (!noteCard.isIdeaLiked || noteCard.isIdeaLiked.length !== noteCard.keyTakeaways.length) {
      noteCard.isIdeaLiked = new Array(noteCard.keyTakeaways.length).fill(false);
    }

    noteCard.isIdeaLiked[ideaIndex] = !noteCard.isIdeaLiked[ideaIndex];

    return this.noteCardRepository.save(noteCard);
  }

  async remove(id: string, userId: string): Promise<void> {
    const noteCard = await this.findOneByUserId(id, userId);
    noteCard.isActive = false;
    await this.noteCardRepository.save(noteCard);
  }
}
