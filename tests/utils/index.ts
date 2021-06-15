import type { Entity } from '@shattercms/types';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import shardModule from '../../src';
import path from 'path';
import { createConnection, getConnection } from 'typeorm';

const initModule = async () => {
  const resolvers: Array<Function> = [];
  const entities: Array<Entity> = [];
  await shardModule({ entities, resolvers } as any, {});
  return { resolvers, entities };
};

export const connection = {
  async create() {
    const { entities } = await initModule();
    await createConnection({
      name: 'default',
      type: 'postgres',
      username: 'postgres',
      password: 'postgres',
      database: 'shattercms-test',
      synchronize: true,
      dropSchema: true,
      entities: entities as any,
    });
  },

  async close() {
    await getConnection().close();
  },

  async clear() {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  },
};

let schema: GraphQLSchema;
export const getSchema = async (emitSchema = false) => {
  if (schema) return schema;
  const { resolvers } = await initModule();
  schema = await buildSchema({
    resolvers: resolvers as any,
    emitSchemaFile: emitSchema
      ? path.resolve(__dirname, '../graphql/schema.gql')
      : undefined,
  });
  return schema;
};

export const graphqlFetch = async <T, V = { [key: string]: any }>(
  document: string,
  resource: keyof T,
  variables?: V
): Promise<[response?: T[keyof T], error?: unknown]> => {
  try {
    const response = await graphql({
      schema: await getSchema(),
      source: document,
      variableValues: variables,
    });
    return [(response.data as T)[resource], undefined];
  } catch (error: unknown) {
    return [undefined, error];
  }
};
