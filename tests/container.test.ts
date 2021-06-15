import { getConnection, Repository } from 'typeorm';
import { Page, Shard } from '../src';
import { connection, graphqlFetch } from './utils';
import * as resources from './utils/resources';
import { containerApplyChangesMutation } from './graphql/mutations';
import type {
  ContainerApplyChangesMutation,
  ContainerApplyChangesMutationVariables,
} from './graphql';

let pageRepo: Repository<Page>;
let shardRepo: Repository<Shard>;
beforeAll(async () => {
  await connection.create();
  pageRepo = getConnection().getRepository(Page);
  shardRepo = getConnection().getRepository(Shard);
});
afterAll(async () => {
  await connection.close();
});
beforeEach(async () => {
  await connection.clear();
});

it('creates shards through applying changes', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });

  const [response, error] = await graphqlFetch<
    ContainerApplyChangesMutation,
    ContainerApplyChangesMutationVariables
  >(containerApplyChangesMutation, 'container_applyChanges', {
    id: page.id,
    changes: resources.changesAdd(),
  });
  if (!response) throw error;

  const shardId = response[0][1];
  expect(response).toStrictEqual([[-1, expect.any(Number)]]);
  const shard = await shardRepo.findOne(shardId);
  expect(shard).toMatchObject({
    id: shardId,
    type: 'common-text-block',
    data: JSON.stringify({ text: 'here be dragons' }),
  });
});

it('edits shards through applying changes', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });
  const shard = await shardRepo.save({
    containerId: page.id,
    type: 'common-text-block',
    data: JSON.stringify({ text: 'here be dragons' }),
  });

  const [response, error] = await graphqlFetch<
    ContainerApplyChangesMutation,
    ContainerApplyChangesMutationVariables
  >(containerApplyChangesMutation, 'container_applyChanges', {
    id: page.id,
    changes: resources.changesEdit(shard.id),
  });
  if (!response) throw error;

  expect(response).toStrictEqual([]);
  const shardUpdated = await shardRepo.findOne(shard.id);
  expect(shardUpdated).toMatchObject({
    ...shard,
    data: JSON.stringify({ text: 'there are dragons 🐉' }),
  });
});

it('reorders shards through applying changes', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });
  const shard = await shardRepo.save({
    containerId: page.id,
    type: 'common-text-block',
    data: JSON.stringify({ text: 'here be dragons' }),
  });

  const [response, error] = await graphqlFetch<
    ContainerApplyChangesMutation,
    ContainerApplyChangesMutationVariables
  >(containerApplyChangesMutation, 'container_applyChanges', {
    id: page.id,
    changes: resources.changesAddAnother(shard.id),
  });
  if (!response) throw error;

  expect(response).toStrictEqual([[-1, expect.any(Number)]]);
  const shardUpdated1 = await shardRepo.findOne(shard.id);
  expect(shardUpdated1).toMatchObject({ ...shard, order: 1 });
  const shardId = response[0][1];
  const shardUpdated2 = await shardRepo.findOne(shardId);
  expect(shardUpdated2).toMatchObject({
    id: shardId,
    type: 'common-header',
    data: JSON.stringify({}),
    order: 0,
  });
});

it('deletes shards through applying changes', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });
  const shard1 = await shardRepo.save({
    containerId: page.id,
    type: 'common-text-block',
    data: JSON.stringify({ text: 'here be dragons' }),
  });
  const shard2 = await shardRepo.save({
    containerId: page.id,
    type: 'common-header',
    data: JSON.stringify({ text: 'there are dragons 🐉' }),
  });

  const [response, error] = await graphqlFetch<
    ContainerApplyChangesMutation,
    ContainerApplyChangesMutationVariables
  >(containerApplyChangesMutation, 'container_applyChanges', {
    id: page.id,
    changes: resources.changesDelete([shard1.id, shard2.id]),
  });
  if (!response) throw error;

  expect(response).toStrictEqual([]);

  const shard1Updated = await shardRepo.findOne(shard1.id);
  const shard2Updated = await shardRepo.findOne(shard2.id);
  expect(shard1Updated).toBeUndefined();
  expect(shard2Updated).toBeUndefined();
});
