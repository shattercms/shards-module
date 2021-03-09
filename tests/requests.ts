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
