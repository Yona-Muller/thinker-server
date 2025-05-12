import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from './entitys/memory.entity';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(Memory)
    private memoriesRepository: Repository<Memory>
  ) {}

  async create(createMemoryDto: CreateMemoryDto): Promise<Memory> {
    const memory = this.memoriesRepository.create(createMemoryDto);
    return await this.memoriesRepository.save(memory);
  }

  async findAll(userId: string): Promise<Memory[]> {
    return this.memoriesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['noteCard'],
    });
  }

  async findByNoteCard(noteCardId: string, userId: string): Promise<Memory[]> {
    return this.memoriesRepository.find({
      where: { noteCardId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTags(tags: string[], userId: string): Promise<Memory[]> {
    // Find memories that contain any of the specified tags
    const memories = await this.memoriesRepository.find({
      where: { userId },
      relations: ['noteCard'],
    });

    // Filter memories that contain at least one of the specified tags
    return memories.filter((memory) => memory.tags.some((tag) => tags.includes(tag)));
  }

  async findOne(id: string, userId: string): Promise<Memory> {
    const memory = await this.memoriesRepository.findOne({
      where: { id, userId },
      relations: ['noteCard'],
    });

    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }

    return memory;
  }

  async update(id: string, userId: string, updateMemoryDto: UpdateMemoryDto): Promise<Memory> {
    const memory = await this.findOne(id, userId);

    // Update fields
    Object.assign(memory, updateMemoryDto);

    return this.memoriesRepository.save(memory);
  }

  async toggleLike(id: string, userId: string): Promise<Memory> {
    const memory = await this.findOne(id, userId);
    memory.isLiked = !memory.isLiked;
    return this.memoriesRepository.save(memory);
  }

  async remove(id: string, userId: string): Promise<void> {
    const memory = await this.findOne(id, userId);
    await this.memoriesRepository.remove(memory);
  }
}
