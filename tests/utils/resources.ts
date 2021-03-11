import faker from 'faker';
import { graphqlExecute } from '.';

export const pageGetQuery = `
query pageGet($id: Int!) {
  page_get(id: $id) {
    id
    path
    title
    description
    layout {
      id
    }
  }
}
`;

export const pageGetAllQuery = `
query pageGetAll {
  page_getAll {
    id
    path
    title
    description
    layout {
      id
    }
  }
}
`;

export const pageCreateMutation = `
mutation pageCreate($params: CreatePageInput!) {
  page_create(params: $params) {
    id
    path
    title
    description
    layout {
      id
    }
  }
}
`;

export const pageUpdateMutation = `
mutation pageUpdate($id: Int!, $params: UpdatePageInput!) {
  page_update(id: $id, params: $params)
}
`;

export const containerApplyChanges = `
mutation pageCreate($id: Int!, $changes: String!) {
  container_applyChanges(id: $id, changes: $changes)
}
`;

export const changesAddTextBlock = JSON.stringify([
  {
    type: 'add',
    data: {
      type: 'common-text-block',
      id: -1,
      order: 0,
      data: '{}',
    },
  },
]);

export const fakePage = () => ({
  path: '/' + faker.lorem.slug().replace(' ', '-'),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
});
