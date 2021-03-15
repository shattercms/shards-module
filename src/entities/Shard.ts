import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShardContainer } from './Container';

@ObjectType()
@Entity()
export class Shard {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  type!: string;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  order!: number;

  @Field({ defaultValue: '{}' })
  @Column({ default: '{}' })
  data!: string;

  @Column()
  containerId!: number;
  @Field(() => ShardContainer)
  @ManyToOne(() => ShardContainer, (container) => container.shards)
  container!: ShardContainer;
}
