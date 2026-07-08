import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyStock } from './CompanyStock';

@Entity({ name: 'stock_price_history' })
@Index(['company', 'dateRecorded'])
export class StockPriceHistory {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @ManyToOne(() => CompanyStock, (company) => company.prices, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyStock;

  @Column({ name: 'price', type: 'double precision' })
  price!: number;

  @Column({ name: 'market_cap', type: 'number', precision: 20, scale: 2, nullable: true })
  marketCap!: number | null;

  @Index()
  @Column({ name: 'date_recorded', type: 'date' })
  dateRecorded!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
