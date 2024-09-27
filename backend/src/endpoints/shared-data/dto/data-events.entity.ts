import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataEventsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @Column('jsonb')
  payload: any;
}