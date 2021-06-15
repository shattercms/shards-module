export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateLayoutInput = {
  bodyIndex?: Maybe<Scalars['Int']>;
  description: Scalars['String'];
  title: Scalars['String'];
};

export type CreatePageInput = {
  description: Scalars['String'];
  layoutId?: Maybe<Scalars['Int']>;
  path: Scalars['String'];
  title: Scalars['String'];
};

export type CreateShardInput = {
  containerId: Scalars['Int'];
  data?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  type: Scalars['String'];
};

export type Layout = {
  bodyIndex: Scalars['Int'];
  description: Scalars['String'];
  id: Scalars['Int'];
  shards: Array<Shard>;
  title: Scalars['String'];
};

export type Mutation = {
  container_applyChanges: Array<Array<Scalars['Float']>>;
  layout_create: Layout;
  layout_delete: Scalars['Boolean'];
  layout_update: Scalars['Boolean'];
  page_create: Page;
  page_delete: Scalars['Boolean'];
  page_update: Scalars['Boolean'];
  shard_applyChanges: Scalars['Boolean'];
  shard_create: Shard;
  shard_delete: Scalars['Boolean'];
  shard_update: Scalars['Boolean'];
};


export type MutationContainer_ApplyChangesArgs = {
  changes: Scalars['String'];
  id: Scalars['Int'];
};


export type MutationLayout_CreateArgs = {
  params: CreateLayoutInput;
};


export type MutationLayout_DeleteArgs = {
  id: Scalars['Int'];
};


export type MutationLayout_UpdateArgs = {
  id: Scalars['Int'];
  params: UpdateLayoutInput;
};


export type MutationPage_CreateArgs = {
  params: CreatePageInput;
};


export type MutationPage_DeleteArgs = {
  id: Scalars['Int'];
};


export type MutationPage_UpdateArgs = {
  id: Scalars['Int'];
  params: UpdatePageInput;
};


export type MutationShard_ApplyChangesArgs = {
  changes: Scalars['String'];
  id: Scalars['Int'];
};


export type MutationShard_CreateArgs = {
  params: CreateShardInput;
};


export type MutationShard_DeleteArgs = {
  id: Scalars['Int'];
};


export type MutationShard_UpdateArgs = {
  id: Scalars['Int'];
  params: UpdateShardInput;
};

export type Page = {
  description: Scalars['String'];
  id: Scalars['Int'];
  layout?: Maybe<Layout>;
  path: Scalars['String'];
  shards: Array<Shard>;
  title: Scalars['String'];
};

export type PageAtResult = {
  page: Page;
  params: Array<Array<Scalars['String']>>;
};

export type Query = {
  layout_get?: Maybe<Layout>;
  layout_getAll: Array<Layout>;
  page_at?: Maybe<PageAtResult>;
  page_get?: Maybe<Page>;
  page_getAll: Array<Page>;
  shard_get?: Maybe<Shard>;
  shard_getAll: Array<Shard>;
};


export type QueryLayout_GetArgs = {
  id: Scalars['Int'];
};


export type QueryPage_AtArgs = {
  path: Scalars['String'];
};


export type QueryPage_GetArgs = {
  id: Scalars['Int'];
};


export type QueryShard_GetArgs = {
  id: Scalars['Int'];
};

export type Shard = {
  container: ShardContainer;
  data?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  order?: Maybe<Scalars['Int']>;
  type: Scalars['String'];
};

export type ShardContainer = {
  id: Scalars['Int'];
  shards: Array<Shard>;
};

export type UpdateLayoutInput = {
  bodyIndex?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type UpdatePageInput = {
  description?: Maybe<Scalars['String']>;
  layoutId?: Maybe<Scalars['Int']>;
  path?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type UpdateShardInput = {
  containerId?: Maybe<Scalars['Int']>;
  data?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
};

export type PageCreateMutationVariables = Exact<{
  params: CreatePageInput;
}>;


export type PageCreateMutation = { page_create: Pick<Page, 'id' | 'path' | 'title' | 'description'> };

export type PageUpdateMutationVariables = Exact<{
  id: Scalars['Int'];
  params: UpdatePageInput;
}>;


export type PageUpdateMutation = Pick<Mutation, 'page_update'>;

export type ContainerApplyChangesMutationVariables = Exact<{
  id: Scalars['Int'];
  changes: Scalars['String'];
}>;


export type ContainerApplyChangesMutation = Pick<Mutation, 'container_applyChanges'>;

export type PageGetQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type PageGetQuery = { page_get?: Maybe<Pick<Page, 'id' | 'path' | 'title' | 'description'>> };

export type PageAtQueryVariables = Exact<{
  path: Scalars['String'];
}>;


export type PageAtQuery = { page_at?: Maybe<(
    Pick<PageAtResult, 'params'>
    & { page: Pick<Page, 'id' | 'path' | 'title' | 'description'> }
  )> };

export type PageGetAllQueryVariables = Exact<{ [key: string]: never; }>;


export type PageGetAllQuery = { page_getAll: Array<Pick<Page, 'id' | 'path' | 'title' | 'description'>> };
