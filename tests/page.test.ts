import { Connection, Repository } from 'typeorm';
import { Page } from '../src';
import { getConnection, graphqlExecute } from './utils';
import * as resources from './utils/resources';

// Handle database connection
let connection: Connection;
let pageRepo: Repository<Page>;
beforeAll(async () => {
  connection = await getConnection();
  pageRepo = connection.getRepository(Page);

  await pageRepo.save(
    pageRepo.create({
      path: '/page-at-test/:foo/:bar',
      title: '',
      description: '',
    })
  );
  await pageRepo.save(
    pageRepo.create({
      path: '/page-at-test/:foo/prefer-me',
      title: '',
      description: '',
    })
  );
  await pageRepo.save(
    pageRepo.create({
      path: '/page-at-test/prefer-me',
      title: '',
      description: '',
    })
  );
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

  it('Get page at: static', async () => {
    const result = await graphqlExecute(resources.pageAtQuery, {
      path: '/page-at-test/prefer-me',
    });
    expect(result.data?.page_at.page.path).toBe('/page-at-test/prefer-me');
  });

  it('Get page at: dynamic', async () => {
    const result = await graphqlExecute(resources.pageAtQuery, {
      path: '/page-at-test/value1/value2',
    });

    expect(result.data?.page_at.page.path).toBe('/page-at-test/:foo/:bar');
    expect(result.data?.page_at.params).toMatchObject([
      ['foo', 'value1'],
      ['bar', 'value2'],
    ]);
  });

  it('Get page at: static prefer specific', async () => {
    const result = await graphqlExecute(resources.pageAtQuery, {
      path: '/page-at-test/prefer-me',
    });

    expect(result.data?.page_at.page.path).toBe('/page-at-test/prefer-me');
    expect(result.data?.page_at.params).toMatchObject([]);
  });

  it('Get page at: dynamic prefer specific', async () => {
    const result = await graphqlExecute(resources.pageAtQuery, {
      path: '/page-at-test/value1/prefer-me',
    });

    expect(result.data?.page_at.page.path).toBe('/page-at-test/:foo/prefer-me');
    expect(result.data?.page_at.params).toMatchObject([['foo', 'value1']]);
  });

  it('Get page at: do not match exact path', async () => {
    const result = await graphqlExecute(resources.pageAtQuery, {
      path: '/page-at-test/:foo/:bar',
    });

    expect(result.data?.page_at.page.path).toBe('/page-at-test/:foo/:bar');
    expect(result.data?.page_at.params).toMatchObject([
      ['foo', ':foo'],
      ['bar', ':bar'],
    ]);
  });
});
