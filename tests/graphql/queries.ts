export const pageGetQuery = /* GraphQL*/ `
  query pageGet($id: Int!) {
    page_get(id: $id) {
      id
      path
      title
      description
    }
  }
`;

export const pageAtQuery = /* GraphQL*/ `
  query pageAt($path: String!) {
    page_at(path: $path) {
      page {
        id
        path
        title
        description
      }
      params
    }
  }
`;

export const pageGetAllQuery = /* GraphQL*/ `
  query pageGetAll {
    page_getAll {
      id
      path
      title
      description
    }
  }
`;
