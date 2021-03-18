import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { Layout } from '../entities/Layout';
import { Page } from '../entities/Page';
import { ShardContainerResolver } from './container';
import { match as regexMatch } from 'path-to-regexp';

@InputType()
class CreatePageInput {
  @Field()
  path!: string;
  @Field()
  title!: string;
  @Field()
  description!: string;
  @Field(() => Int, { nullable: true })
  layoutId?: number;
}

@InputType()
class UpdatePageInput {
  @Field({ nullable: true })
  path?: string;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => Int, { nullable: true })
  layoutId?: number;
}

@ObjectType()
class PageAtResult {
  @Field()
  page!: Page;
  @Field(() => [[String]])
  params!: Array<[name: string, value: string]>;
}

@Resolver(Page)
export class PageResolver extends ShardContainerResolver {
  private pageRepo = getRepository(Page);
  private layoutRepo = getRepository(Layout);

  constructor() {
    super();
  }

  @Query(() => [Page])
  page_getAll() {
    return this.pageRepo.find();
  }

  @Query(() => Page, { nullable: true })
  page_get(@Arg('id', () => Int) id: number) {
    return this.pageRepo.findOne(id);
  }

  @Query(() => PageAtResult, { nullable: true })
  async page_at(@Arg('path') path: string): Promise<PageAtResult | null> {
    const pages = await this.pageRepo.find();

    let bestLength = Infinity;
    const result = {
      page: null as Page | null,
      params: {} as { [key: string]: string },
    };

    // Find best match
    pages.forEach((page) => {
      const match = regexMatch(page.path, {
        encode: encodeURI,
        decode: decodeURIComponent,
      });
      const matches = match(path);
      // Prefer more precise matches
      if (!matches || Object.keys(matches.params).length > bestLength) return;

      result.page = page;
      result.params = matches.params as { [key: string]: string };
    });
    if (!result.page) return null;

    // Format parameters
    const paramsArray = [] as [name: string, value: string][];
    for (const key in result.params) {
      paramsArray.push([key, result.params[key]]);
    }

    return {
      page: result.page,
      params: paramsArray,
    };
  }

  @Mutation(() => Page)
  page_create(@Arg('params') params: CreatePageInput) {
    const page = this.pageRepo.create(params);
    return this.pageRepo.save(page);
  }

  @Mutation(() => Boolean)
  async page_update(
    @Arg('id', () => Int) id: number,
    @Arg('params') params: UpdatePageInput
  ) {
    await this.pageRepo.update(id, params);
    return true;
  }

  @Mutation(() => Boolean)
  async page_delete(@Arg('id', () => Int) id: number) {
    await this.pageRepo.delete(id);
    return true;
  }

  @FieldResolver(() => Page, { nullable: true })
  layout(@Root() page: Page) {
    if (!page.layoutId) return;
    return this.layoutRepo.findOne(page.layoutId);
  }
}
