import { Connection } from 'typeorm';
import { getConnection, graphqlExecute } from './utils';
import faker from 'faker';
import {
  fakePage,
  pageCreateMutation,
  pageGetAllQuery,
  pageGetQuery,
  pageUpdateMutation,
} from './utils/resources';
import { Page } from '../src';

// Handle database connection
let connection: Connection;
beforeAll(async () => {
  connection = await getConnection();
});
afterAll(async () => {
  await connection.close();
});

let page = fakePage() as any;

describe('Page Resolver', () => {
  it('Create page', async () => {
    const result = await graphqlExecute(pageCreateMutation, { params: page });
    page.id = result.data?.page_create.id;
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
});
