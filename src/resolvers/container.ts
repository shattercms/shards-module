import {
  FieldResolver,
  Resolver,
  Root,
  ClassType,
  Mutation,
  Arg,
  Int,
} from 'type-graphql';
import { getManager } from 'typeorm';
import { Shard } from '../entities/Shard';
import { ShardContainer } from '../entities/Container';
import { deepApply } from '../utils';

@Resolver(ShardContainer as ClassType, { isAbstract: true })
export abstract class ShardContainerResolver {
  @Mutation(() => Boolean)
  async container_applyChanges(
    @Arg('id', () => Int) id: number,
    @Arg('changes') changesJson: string
  ): Promise<boolean> {
    // Parse data
    let changes: { type: string; data: any }[] = [];
    changes = JSON.parse(changesJson);

    // Start transaction
    await getManager().transaction(async (tem) => {
      const shardRepo = await tem.getRepository(Shard);
      const containerRepo = await tem.getRepository(ShardContainer);

      // Get container
      const container = await containerRepo.findOne(id, {
        relations: ['shards'],
      });
      if (!container) {
        throw new Error('Container not found');
      }

      // Apply changes
      for (const change of changes) {
        if (change.type === 'add') {
          const newShard = shardRepo.create({
            containerId: container.id,
            order: change.data.order ?? 0,
            data: change.data.data ?? '{}',
            type: change.data.type,
          });
          container.shards.push(newShard);
          await shardRepo.save(newShard);
          continue;
        }
        if (change.type === 'remove') {
          await shardRepo.delete({ id: change.data });
          continue;
        }
        if (change.type === 'edit') {
          const data = change.data as { id: number; changes: any };
          const shard = container.shards.find((s) => s.id === data.id);
          if (!shard) {
            throw new Error('Shard not found');
          }
          let shardData = {};
          if (shard.data) {
            shardData = JSON.parse(shard.data);
          }
          const newData = deepApply(shardData, data.changes);
          shard.data = JSON.stringify(newData);
          await shardRepo.save(shard);
          continue;
        }
        if (change.type === 'order') {
          const orders = change.data as { id: number; order: number }[];
          for (const order of orders) {
            const shard = await shardRepo.findOne(order.id);
            if (!shard) {
              throw new Error('Shard not found');
            }
            shard.order = order.order;
            await shardRepo.save(shard);
          }
          continue;
        }
      }

      // Update container
      await containerRepo.save(container);
    });

    return true;
  }

  @FieldResolver()
  async shards(@Root() shards: Shard[]): Promise<Shard[]> {
    const items: Shard[] = await getManager()
      .createQueryBuilder()
      .relation(ShardContainer, 'shards')
      .of(shards)
      .loadMany();
    items.sort((a, b) => a.order - b.order);
    return items;
  }
}
