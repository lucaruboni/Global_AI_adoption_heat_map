import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CountryStatsSnapshot } from './CountryStatsSnapshot';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'iso3', type: 'varchar2', length: 3 })
  iso3!: string;

  @Column({ name: 'name', type: 'varchar2', length: 100 })
  name!: string;

  @Index()
  @Column({ name: 'region', type: 'varchar2', length: 50 })
  region!: string;

  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ name: 'gdp_2024', type: 'number', precision: 20, scale: 2, nullable: true })
  gdp2024!: number | null;

  @Column({ name: 'working_age_population', type: 'number', nullable: true })
  workingAgePopulation!: number | null;

  @OneToMany(() => CountryStatsSnapshot, (snapshot) => snapshot.country)
  snapshots!: CountryStatsSnapshot[];
}
