import { Layout, Page, Shard, ShardContainer } from './entities';
import {
  LayoutResolver,
  PageResolver,
  ShardContainerResolver,
  ShardResolver,
} from './resolvers';
export * from './entities';
export * from './resolvers';

export interface ShardModuleOptions {}

import type { Module } from '@shattercms/types';
const shardsModule: Module<ShardModuleOptions> = (context) => {
  context.entities.push(...[Shard, Page, Layout, ShardContainer]);
  context.resolvers.push(
    ...[ShardResolver, PageResolver, LayoutResolver, ShardContainerResolver]
  );
};
export default shardsModule;
