import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DownloadRequest } from './DownloadRequest';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar2', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar2', length: 255 })
  passwordHash!: string;

  @Column({ name: 'github_username', type: 'varchar2', length: 255, nullable: true })
  githubUsername!: string | null;

  @Column({ name: 'linkedin_url', type: 'varchar2', length: 500, nullable: true })
  linkedinUrl!: string | null;

  @Column({ name: 'opted_in_newsletter', type: 'number', width: 1, default: 0 })
  optedInNewsletter!: number;

  @Column({ name: 'download_count', type: 'number', default: 0 })
  downloadCount!: number;

  @Column({ name: 'last_download_at', type: 'timestamp', nullable: true })
  lastDownloadAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => DownloadRequest, (download) => download.user)
  downloads!: DownloadRequest[];
}
