import { Connection, Repository } from 'typeorm';
import { Shard } from '../src';
import { getConnection, graphqlExecute } from './utils';
import * as resources from './utils/resources';

// Handle database connection
let connection: Connection;
let shardRepo: Repository<Shard>;
let page: any;
beforeAll(async () => {
  connection = await getConnection();
  shardRepo = connection.getRepository(Shard);

  // Create page
  page = await graphqlExecute(resources.pageCreateMutation, {
    params: resources.fakePage(),
  }).then((res) => res.data?.page_create);
});
afterAll(async () => {
  await connection.close();
});

describe('Container Resolver', () => {
  let ids = [-1, -1];
  it('Apply changes: create', async () => {
    // Add shard through applying changes
    const result = await graphqlExecute(resources.containerApplyChanges, {
      id: page.id,
      changes: resources.changesAdd(),
    });
    expect(result).toEqual(
      expect.objectContaining({
        data: { container_applyChanges: [[-1, expect.any(Number)]] },
      })
    );

    // Get shard id for later testing
    const shardId = result.data?.container_applyChanges[0][1];
    expect(shardId).toBeGreaterThan(-1);
    ids[0] = shardId;

    // Check if text was set correctly
    const shard = await shardRepo.findOne(ids[0]);
    expect(shard?.data).toMatch(JSON.stringify({ text: 'here be dragons' }));
  });

  it('Apply changes: edit', async () => {
    // Edit shard through applying changes
    const result = await graphqlExecute(resources.containerApplyChanges, {
      id: page.id,
      changes: resources.changesEdit(ids[0]),
    });
    expect(result).toMatchObject({
      data: { container_applyChanges: [] },
    });

    // Check if text was updated correctly
    const shard = await shardRepo.findOne(ids[0]);
    expect(shard?.data).toMatch(
      JSON.stringify({ text: 'there are dragons 🐉' })
    );
  });

  it('Apply changes: order', async () => {
    // Add another shard through applying changes
    const result = await graphqlExecute(resources.containerApplyChanges, {
      id: page.id,
      changes: resources.changesAddAnother(ids[0]),
    });
    expect(result).toEqual(
      expect.objectContaining({
        data: { container_applyChanges: [[-1, expect.any(Number)]] },
      })
    );

    // Check if order was set correctly
    const shard = await shardRepo.findOne(ids[0]);
    expect(shard?.order).toBe(1);

    // Get second shard id
    const shardId = result.data?.container_applyChanges[0][1];
    expect(shardId).toBeGreaterThan(-1);
    ids[1] = shardId;
  });

  it('Apply changes: delete', async () => {
    // Delete both shards through applying changes
    const result = await graphqlExecute(resources.containerApplyChanges, {
      id: page.id,
      changes: resources.changesDelete(ids),
    });
    expect(result).toMatchObject({
      data: { container_applyChanges: [] },
    });

    // Check if the shards were deleted
    const shard1 = await shardRepo.findOne(ids[0]);
    const shard2 = await shardRepo.findOne(ids[1]);
    expect(shard1).toBeFalsy();
    expect(shard2).toBeFalsy();
  });
});
