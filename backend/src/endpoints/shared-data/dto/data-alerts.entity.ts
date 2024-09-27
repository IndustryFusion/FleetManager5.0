import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataAlertsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  environment: string;

  @Column()
  event: string;

  @Column()
  urn_id: string;

  @Column()
  group: string;

  @Column()
  receiveTime: string;

  @Column()
  resource: string;

  @Column()
  severity: string;

  @Column()
  text: string;
}