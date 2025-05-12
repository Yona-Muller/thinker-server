import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NoteCard } from '../../notecards/entities/notecard.entity';

export enum MemoryType {
  FLASHBACK = 'flashback',
  INSIGHT = 'insight',
  QUOTE = 'quote',
}

@Entity('memories')
export class Memory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  noteCardId: string;

  @ManyToOne(() => NoteCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'noteCardId' })
  noteCard: NoteCard;

  @Column({ type: 'text' })
  content: string;

  @Column('varchar', { array: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: MemoryType,
    default: MemoryType.FLASHBACK,
  })
  type: MemoryType;

  @Column({ type: 'boolean', default: false })
  isLiked: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
