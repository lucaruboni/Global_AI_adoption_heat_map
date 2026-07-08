import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A point-in-time index of AI-capable hardware sales (GPUs, CPUs, RAM).
 * A proxy for the world's on-premise / local AI inference capacity.
 */
@Entity({ name: 'hardware_sales_index' })
export class HardwareSalesIndex {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'date_recorded', type: 'date' })
  dateRecorded!: Date;

  @Column({ name: 'gpu_sales_units', type: 'number', nullable: true })
  gpuSalesUnits!: number | null;

  @Column({ name: 'cpu_sales_units', type: 'number', nullable: true })
  cpuSalesUnits!: number | null;

  @Column({ name: 'ram_gb_sold', type: 'number', precision: 16, scale: 2, nullable: true })
  ramGbSold!: number | null;

  @Column({ name: 'price_index', type: 'double precision', nullable: true })
  priceIndex!: number | null;

  @Column({ name: 'source', type: 'varchar2', length: 100, nullable: true })
  source!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
