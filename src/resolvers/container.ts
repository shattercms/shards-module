import {
  FieldResolver,
  Resolver,
  Root,
  ClassType,
  Mutation,
  Arg,
  Int,
  ObjectType,
} from 'type-graphql';
import { getManager } from 'typeorm';
import { Shard } from '../entities/Shard';
import { ShardContainer } from '../entities/Container';
import { applyChange, Diff } from 'deep-diff';
import { applyShardChanges } from '../utils';

@Resolver(ShardContainer as ClassType, { isAbstract: true })
export abstract class ShardContainerResolver {
  @Mutation(() => [[Number, Number]])
  async container_applyChanges(
    @Arg('id', () => Int) id: number,
    @Arg('changes') changesJson: string
  ) {
    // Parse data
    const changes = JSON.parse(changesJson) as Diff<Shard | Diff<any>[]>[];

    // Start transaction
    const idMappings: Array<[oldId: number, newId: number]> = [];
    await getManager().transaction(async (tem) => {
      const shardRepo = tem.getRepository(Shard);
      const containerRepo = tem.getRepository(ShardContainer);

      // Get the container and shards
      const container = await containerRepo.findOne(id, {
        relations: ['shards'],
      });
      if (!container) {
        throw new Error('Container not found');
      }

      /* Handle adding a new shard */
      const shardAdd = async (shard: Shard) => {
        // Create a new shard
        const newShard = shardRepo.create({
          ...shard,
          data: shard.data ? JSON.stringify(shard.data) : undefined,
          containerId: container.id,
        });

        // Save the new shard to the database
        const savedShard = await shardRepo.save(newShard);

        // Add the new shard to the container
        container.shards.push(savedShard);

        // Save the assigned shard id, so it can be returned later
        idMappings.push([shard.id, savedShard.id]);
      };

      /* Handle removing a shard */
      const shardRemove = async (shard: Shard) => {
        // Remove shard from database
        await shardRepo.delete({ id: shard.id });

        // Remove shard from the container
        const index = container.shards.findIndex((s) => s.id === shard.id);
        if (index > -1) {
          container.shards.splice(index, 1);
        }
      };

      /* Handle editing a shard */
      const shardEdit = async (id: number, changes: Diff<any>[]) => {
        // Get shard
        let shard = container.shards.find((s) => s.id === id);
        if (!shard) throw new Error('Could not find the specified shard.');

        console.log(shard);

        // Apply changes
        shard = applyShardChanges(shard, changes);

        console.log(shard);

        // Save shard
        await shardRepo.save(shard);
      };

      // Loop through and handle all changes
      for (const change of changes) {
        if (change.path) {
          // Handle shard edit operations
          if (change.kind === 'E' && change.path.length === 1)
            await shardEdit(change.path[0], change.lhs as Diff<any>[]);
        } else {
          // Handle shard add / remove operations
          if (change.kind === 'N') await shardAdd(change.rhs as Shard);
          if (change.kind === 'D') await shardRemove(change.lhs as Shard);
        }
      }

      // Save container
      await containerRepo.save(container);
    });

    return idMappings;
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

const replaceId = (
  id: number,
  replaceMappings: Array<[oldId: number, newId: number]>
) => {
  const newId = replaceMappings.find((x) => x[0] === id)?.[1];
  if (newId) return newId;
  return id;
};
