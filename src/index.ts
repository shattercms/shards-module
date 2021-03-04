import { Layout, Page, Shard, ShardContainer } from './entities';
import { LayoutResolver, PageResolver, ShardResolver } from './resolvers';
export * from './entities';
export * from './resolvers';
export { deepApply, deepChanges } from './utils';

import { Module } from '@shattercms/types';
const shatterModule: Module = (context) => {
  context.entities.push(...[Shard, Page, Layout, ShardContainer]);
  context.resolvers.push(...[ShardResolver, PageResolver, LayoutResolver]);
};
export default shatterModule;
