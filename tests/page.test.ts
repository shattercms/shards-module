import { Page } from '../src';
import type {
  CreatePageInput,
  PageAtQuery,
  PageAtQueryVariables,
  PageCreateMutation,
  PageCreateMutationVariables,
  PageGetQuery,
  PageGetQueryVariables,
  PageUpdateMutation,
  PageUpdateMutationVariables,
} from './graphql';
import { pageGetQuery, pageAtQuery } from './graphql/queries';
import { pageCreateMutation, pageUpdateMutation } from './graphql/mutations';
import { connection, graphqlFetch } from './utils';
import { getConnection, Repository } from 'typeorm';

let pageRepo: Repository<Page>;
beforeAll(async () => {
  await connection.create();
  pageRepo = getConnection().getRepository(Page);
});
afterAll(async () => {
  await connection.close();
});
beforeEach(async () => {
  await connection.clear();
});

it('creates a page', async () => {
  const page: CreatePageInput = {
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  };

  const [response, error] = await graphqlFetch<
    PageCreateMutation,
    PageCreateMutationVariables
  >(pageCreateMutation, 'page_create', { params: page });
  if (!response) throw error;

  expect(response).toMatchObject(page);
});

it('updates a page', async () => {
  let page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });

  const [response, error] = await graphqlFetch<
    PageUpdateMutation,
    PageUpdateMutationVariables
  >(pageUpdateMutation, 'page_update', {
    id: page.id,
    params: { path: '/test' },
  });
  if (!response) throw error;

  expect(response).toBe(true);
  page.path = '/test';
  const pageUpdated = await pageRepo.findOne(page.id);
  expect(pageUpdated).toMatchObject(page);
});

it('gets a page by id', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Test Page',
    description: 'This is a page for testing.',
  });
  delete page.layoutId;

  const [response, error] = await graphqlFetch<
    PageGetQuery,
    PageGetQueryVariables
  >(pageGetQuery, 'page_get', { id: page.id });
  if (!response) throw error;

  expect(response).toMatchObject(page);
});

it('gets a static page by path', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Static Page',
    description: 'This is a page for testing.',
  });
  delete page.layoutId;

  const [response, error] = await graphqlFetch<
    PageAtQuery,
    PageAtQueryVariables
  >(pageAtQuery, 'page_at', { path: '/test' });
  if (!response) throw error;

  expect(response.page).toMatchObject(page);
  expect(response.params).toStrictEqual([]);
});

it('gets a dynamic page by path', async () => {
  const page = await pageRepo.save({
    path: '/test/:foo/:bar',
    title: 'Dynamic Page',
    description: 'This is a page for testing.',
  });
  delete page.layoutId;

  const [response, error] = await graphqlFetch<
    PageAtQuery,
    PageAtQueryVariables
  >(pageAtQuery, 'page_at', { path: '/test/hello/world' });
  if (!response) throw error;

  expect(response.page).toMatchObject(page);
  expect(response.params).toStrictEqual([
    ['foo', 'hello'],
    ['bar', 'world'],
  ]);
});

it('prefers a static page over a dynamic one', async () => {
  const page = await pageRepo.save({
    path: '/test',
    title: 'Static Page',
    description: 'This is a static page.',
  });
  delete page.layoutId;
  await pageRepo.save({
    path: '/:foo/:bar',
    title: 'Dynamic Page',
    description: 'This is a dynamic page.',
  });

  const [response, error] = await graphqlFetch<
    PageAtQuery,
    PageAtQueryVariables
  >(pageAtQuery, 'page_at', { path: '/test' });
  if (!response) throw error;

  expect(response.page).toMatchObject(page);
  expect(response.params).toStrictEqual([]);
});

it('prefers a static page with parameter over a dynamic one', async () => {
  const page = await pageRepo.save({
    path: '/:foo/test',
    title: 'Static Page',
    description: 'This is a static page.',
  });
  delete page.layoutId;
  await pageRepo.save({
    path: '/:foo/:bar',
    title: 'Dynamic Page',
    description: 'This is a dynamic page.',
  });

  const [response, error] = await graphqlFetch<
    PageAtQuery,
    PageAtQueryVariables
  >(pageAtQuery, 'page_at', { path: '/hello/test' });
  if (!response) throw error;

  expect(response.page).toMatchObject(page);
  expect(response.params).toStrictEqual([['foo', 'hello']]);
});

it('returns parameters even with exact path match', async () => {
  const page = await pageRepo.save({
    path: '/:foo/:bar',
    title: 'Dynamic Page',
    description: 'This is a dynamic page.',
  });
  delete page.layoutId;

  const [response, error] = await graphqlFetch<
    PageAtQuery,
    PageAtQueryVariables
  >(pageAtQuery, 'page_at', { path: '/:foo/:bar' });
  if (!response) throw error;

  expect(response.page).toMatchObject(page);
  expect(response.params).toStrictEqual([
    ['foo', ':foo'],
    ['bar', ':bar'],
  ]);
});
