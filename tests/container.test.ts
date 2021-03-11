import { Connection } from 'typeorm';
import { getConnection, graphqlExecute } from './utils';
import {
  containerApplyChanges,
  changesAddTextBlock,
  pageCreateMutation,
  fakePage,
} from './utils/resources';

// Handle database connection
let connection: Connection;
beforeAll(async () => {
  connection = await getConnection();
});
afterAll(async () => {
  await connection.close();
});

describe('Container Resolver', () => {
  it('Apply Changes - Create shard', async () => {
    // Create page
    const page = await graphqlExecute(pageCreateMutation, {
      params: fakePage(),
    }).then((res) => res.data?.page_create);

    // Add shard through applying changes
    const result = await graphqlExecute(containerApplyChanges, {
      id: page.id,
      changes: changesAddTextBlock,
    });
    expect(result).toMatchObject({
      data: { container_applyChanges: true },
    });
  });
});
