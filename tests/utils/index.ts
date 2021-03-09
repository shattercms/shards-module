import { Entity } from '@shattercms/types';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import module from '../../src/index';

const resolvers: Array<Function> = [];
const entities: Array<Entity> = [];
module({ entities, resolvers } as any, undefined);

export const getConnection = (dropDatabase = false) => {
  return createConnection({
    name: 'default',
    type: 'postgres',
    username: 'postgres',
    password: 'postgres',
    database: 'cms-test',
    synchronize: dropDatabase,
    dropSchema: dropDatabase,
    entities: entities as any,
  });
};

export const getSchema = () => {
  return buildSchema({
    resolvers: resolvers as any,
  });
};

let schema: GraphQLSchema;
export const graphqlExecute = async (request: string, variables?: any) => {
  if (!schema) {
    schema = await getSchema();
  }

  return graphql({
    schema,
    source: request,
    variableValues: variables,
  });
};
