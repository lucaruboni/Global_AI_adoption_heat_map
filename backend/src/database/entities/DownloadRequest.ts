import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

/** Audit trail: records every dataset download for rate-limiting and analytics. */
@Entity({ name: 'download_requests' })
export class DownloadRequest {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @ManyToOne(() => User, (user) => user.downloads, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'file_format', type: 'varchar2', length: 20, nullable: true })
  fileFormat!: string | null;

  @Column({ name: 'data_version', type: 'varchar2', length: 50, nullable: true })
  dataVersion!: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: Date | null;

  @Column({ name: 'ip_address', type: 'varchar2', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'varchar2', length: 500, nullable: true })
  userAgent!: string | null;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
