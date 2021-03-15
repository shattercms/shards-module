import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { Layout } from '../entities/Layout';
import { Page } from '../entities/Page';
import { ShardContainerResolver } from './container';

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

  @Query(() => Page, { nullable: true })
  async page_at(@Arg('path', () => String) path: string) {
    return this.pageRepo.findOne({ where: { path } });
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
