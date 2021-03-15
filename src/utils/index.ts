import { applyChange, Diff } from 'deep-diff';
import { Shard } from '../entities';

export const applyShardChanges = (shard: Shard, changes: Diff<Shard>[]) => {
  // Parse shard data
  const targetShard = {
    ...shard,
    data: JSON.parse(shard.data),
  };

  // Apply changes
  changes.forEach((change) => {
    applyChange(targetShard, undefined, change);
  });

  // Stringify shard data
  return {
    ...targetShard,
    data: JSON.stringify(targetShard.data),
    id: shard.id, // Disallow changing the shard id
  };
};
