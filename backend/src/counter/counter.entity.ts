import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CounterEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  date!: string;

  @Column({ type: 'integer', default: 0 })
  god!: number;

  @Column({ type: 'integer', default: 0 })
  dog!: number;

  @Column({ type: 'integer', default: 100 })
  limit!: number;
}
