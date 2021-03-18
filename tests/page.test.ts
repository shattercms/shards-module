import { Connection } from 'typeorm';
import { getConnection, graphqlExecute } from './utils';
import * as resources from './utils/resources';

// Handle database connection
let connection: Connection;
beforeAll(async () => {
  connection = await getConnection();
});
afterAll(async () => {
  await connection.close();
});

let page = resources.fakePage() as any;

describe('Page Resolver', () => {
  it('Create page', async () => {
    const result = await graphqlExecute(resources.pageCreateMutation, {
      params: page,
    });
    page.id = result.data?.page_create.id;
    expect(result).toMatchObject({
      data: { page_create: page },
    });
  });

  it('Update page', async () => {
    const result = await graphqlExecute(resources.pageUpdateMutation, {
      id: page.id,
      params: { path: '/test' },
    });
    page.path = '/test';
    expect(result).toMatchObject({
      data: { page_update: true },
    });
  });

  it('Get page', async () => {
    const result = await graphqlExecute(resources.pageGetQuery, {
      id: page.id,
    });
    expect(result).toMatchObject({
      data: { page_get: page },
    });
  });
});
