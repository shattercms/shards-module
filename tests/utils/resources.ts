export const changesAdd = () =>
  `[{"kind":"N","rhs":{"type":"common-text-block","id":-1,"data":{"text":"here be dragons"},"order":0}}]`;
export const changesAddAnother = (id: number) =>
  `[{"kind":"N","rhs":{"type":"common-header","id":-1,"data":{},"order":0}},{"kind":"E","lhs":[{"kind":"E","path":["order"],"lhs":0,"rhs":1}],"rhs":[],"path":[${id}]}]`;
export const changesEdit = (id: number) =>
  `[{"kind":"E","lhs":[{"kind":"E","path":["data","text"],"lhs":"here be dragons","rhs":"there are dragons 🐉"}],"rhs":[],"path":[${id}]}]`;
export const changesDelete = (ids: number[]) =>
  `[{"kind":"D","lhs":{"id":${ids[1]},"type":"common-header","data":{},"order":0}},{"kind":"D","lhs":{"id":${ids[0]},"type":"common-text-block","data":{"text":"there are dragons 🐉"},"order":1}}]`;

export const changesCreateEditOrder = JSON.stringify([
  {
    type: 'add',
    data: {
      type: 'common-text-block',
      id: -1,
      order: 0,
      data: '{}',
    },
  },
  {
    type: 'edit',
    data: {
      id: -1,
      changes: {
        text: 'here be dragons',
      },
    },
  },
  {
    type: 'order',
    data: { order: [[-1, 1]] },
  },
]);
