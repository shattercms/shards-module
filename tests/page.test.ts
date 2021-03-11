import { Connection } from 'typeorm';
import { getConnection, graphqlExecute } from './utils';
import faker from 'faker';
import {
  pageCreateMutation,
  pageGetAllQuery,
  pageGetQuery,
  pageUpdateMutation,
} from './utils/resources';

// Handle database connection
let connection: Connection;
beforeAll(async () => {
  connection = await getConnection();
});
afterAll(async () => {
  await connection.close();
});

let page = {
  path: '/',
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
} as any;

describe('Page Resolver', () => {
  it('Create page', async () => {
    const result = await graphqlExecute(pageCreateMutation, { params: page });
    page.layout = null;
    page.id = 1;
    expect(result).toMatchObject({
      data: { page_create: page },
    });
  });

  it('Update page', async () => {
    const result = await graphqlExecute(pageUpdateMutation, {
      id: page.id,
      params: { path: '/test' },
    });
    page.path = '/test';
    expect(result).toMatchObject({
      data: { page_update: true },
    });
  });

  it('Get page', async () => {
    const result = await graphqlExecute(pageGetQuery, { id: page.id });
    expect(result).toMatchObject({
      data: { page_get: page },
    });
  });

  it('Get all pages', async () => {
    const result = await graphqlExecute(pageGetAllQuery);
    expect(result).toMatchObject({
      data: { page_getAll: [page] },
    });
  });
});
