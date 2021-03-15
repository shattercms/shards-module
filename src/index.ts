import { Layout, Page, Shard, ShardContainer } from './entities';
import {
  LayoutResolver,
  PageResolver,
  ShardContainerResolver,
  ShardResolver,
} from './resolvers';
export * from './entities';
export * from './resolvers';

import { Module } from '@shattercms/types';
const shardsModule: Module = (context) => {
  context.entities.push(...[Shard, Page, Layout, ShardContainer]);
  context.resolvers.push(
    ...[ShardResolver, PageResolver, LayoutResolver, ShardContainerResolver]
  );
};
export default shardsModule;
