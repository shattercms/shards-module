export const pageCreateMutation = /* GraphQL*/ `
  mutation pageCreate($params: CreatePageInput!) {
    page_create(params: $params) {
      id
      path
      title
      description
    }
  }
`;

export const pageUpdateMutation = /* GraphQL*/ `
  mutation pageUpdate($id: Int!, $params: UpdatePageInput!) {
    page_update(id: $id, params: $params)
  }
`;

export const containerApplyChangesMutation = /* GraphQL*/ `
  mutation containerApplyChanges($id: Int!, $changes: String!) {
    container_applyChanges(id: $id, changes: $changes)
  }
`;
