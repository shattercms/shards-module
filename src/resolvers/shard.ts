import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Shard } from '../entities/Shard';
import { getRepository } from 'typeorm';
import { ShardContainer } from '../entities/Container';
import { Diff } from 'deep-diff';
import { applyShardChanges } from '../utils';

@InputType()
class CreateShardInput {
  @Field(() => Int)
  containerId!: number;
  @Field()
  type!: string;
  @Field({ nullable: true })
  data?: string;
  @Field(() => Int, { nullable: true })
  order?: number;
}

@InputType()
class UpdateShardInput {
  @Field({ nullable: true })
  type?: string;
  @Field({ nullable: true })
  data?: string;
  @Field(() => Int, { nullable: true })
  order?: number;
  @Field(() => Int, { nullable: true })
  containerId?: number;
}

@Resolver(Shard)
export class ShardResolver {
  private shardRepo = getRepository(Shard);
  private containerRepo = getRepository(ShardContainer);

  @Query(() => [Shard])
  shard_getAll() {
    return this.shardRepo.find();
  }

  @Query(() => Shard, { nullable: true })
  shard_get(@Arg('id', () => Int) id: number) {
    return this.shardRepo.findOne(id);
  }

  @Mutation(() => Shard)
  shard_create(@Arg('params') params: CreateShardInput) {
    const shard = this.shardRepo.create(params);
    return this.shardRepo.save(shard);
  }

  @Mutation(() => Boolean)
  async shard_delete(@Arg('id', () => Int) id: number) {
    await this.shardRepo.delete(id);
    return true;
  }

  @Mutation(() => Boolean)
  async shard_update(
    @Arg('id', () => Int) id: number,
    @Arg('params') params: UpdateShardInput
  ) {
    await this.shardRepo.update(id, params);
    return true;
  }

  @Mutation(() => Boolean)
  async shard_applyChanges(
    @Arg('id', () => Int) id: number,
    @Arg('changes') changesJson: string
  ) {
    // Get shard
    let shard = await this.shardRepo.findOne(id);
    if (!shard) {
      throw new Error('Shard not found');
    }

    // Parse changes
    const changes = JSON.parse(changesJson) as Diff<Shard>[];

    // Apply changes
    shard = applyShardChanges(shard, changes);

    // Save shard
    await this.shardRepo.save(shard);

    return true;
  }

  @FieldResolver(() => ShardContainer)
  container(@Root() shard: Shard) {
    return this.containerRepo.findOne(shard.containerId);
  }
}
