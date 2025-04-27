import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { NoteCard } from 'src/notecards/entities/notecard.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS_MANAGER = 'BUSINESS_MANAGER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUSINESS_MANAGER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ default: null, name: 'otp_code' })
  otpCode: number;

  @Column({ default: false, name: 'otp_expiration' })
  optExpiration: Date;

  @Column({ default: true, name: 'is_temporary_password' })
  isTemporaryPassword: boolean;

  @Column({ nullable: true, name: 'password_last_changed' })
  passwordLastChanged: Date;

  @Column({ nullable: true, name: 'temporary_password_expiry' })
  temporaryPasswordExpiry: number;

  @Column({ nullable: true, name: 'password_reset_token' })
  passwordResetToken: string;

  @Column({ nullable: true, name: 'password_reset_expires' })
  passwordResetExpires: Date;

  @Column({ nullable: true, name: 'last_login' })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NoteCard, (noteCard) => noteCard.user)
  noteCards: NoteCard[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(plainPassword: string) {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
