import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './Country';

/** A point-in-time snapshot of a country's AI adoption metrics. */
@Entity({ name: 'country_stats_snapshots' })
@Index(['country', 'snapshotDate'])
export class CountryStatsSnapshot {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @ManyToOne(() => Country, (country) => country.snapshots, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country!: Country;

  @Index()
  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: Date;

  @Column({ name: 'usage_pct', type: 'double precision', nullable: true })
  usagePct!: number | null;

  @Column({ name: 'usage_per_capita_index', type: 'double precision', nullable: true })
  usagePerCapitaIndex!: number | null;

  @Column({ name: 'use_case_work_pct', type: 'double precision', nullable: true })
  useCaseWorkPct!: number | null;

  @Column({ name: 'use_case_personal_pct', type: 'double precision', nullable: true })
  useCasePersonalPct!: number | null;

  @Column({ name: 'use_case_coursework_pct', type: 'double precision', nullable: true })
  useCaseCourseworkPct!: number | null;

  @Column({ name: 'collaboration_automation_pct', type: 'double precision', nullable: true })
  collaborationAutomationPct!: number | null;

  @Column({ name: 'collaboration_augmentation_pct', type: 'double precision', nullable: true })
  collaborationAugmentationPct!: number | null;

  @Column({ name: 'ai_autonomy_mean', type: 'double precision', nullable: true })
  aiAutonomyMean!: number | null;

  @Column({ name: 'multitasking_pct', type: 'double precision', nullable: true })
  multitaskingPct!: number | null;

  @Column({ name: 'top_topic', type: 'varchar2', length: 200, nullable: true })
  topTopic!: string | null;

  @Column({ name: 'top_topic_pct', type: 'double precision', nullable: true })
  topTopicPct!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
