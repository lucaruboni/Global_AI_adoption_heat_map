import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StockPriceHistory } from './StockPriceHistory';

/** An AI / cloud company whose valuation we track over time. */
@Entity({ name: 'company_stocks' })
export class CompanyStock {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'symbol', type: 'varchar2', length: 10 })
  symbol!: string;

  @Column({ name: 'name', type: 'varchar2', length: 100 })
  name!: string;

  @Column({ name: 'sector', type: 'varchar2', length: 50, nullable: true })
  sector!: string | null;

  @OneToMany(() => StockPriceHistory, (price) => price.company)
  prices!: StockPriceHistory[];
}
