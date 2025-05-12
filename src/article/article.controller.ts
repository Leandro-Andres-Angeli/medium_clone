import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { CreateArticleDto } from './createArticleDto';
import { User } from 'src/user/decorators/user/user.decorator';
import { UserEntity } from 'src/user/user.entity';
import { ArticleResponse } from './types/articleResponse';
import { UpdateArticleDto } from './updateArticleDto';
import { ArticlesResponseInterface } from './types/articlesResponseInterface';
import { QueryType } from './types/query';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidationPipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: QueryType,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }
  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: { offset?: number; limit?: number },
  ) {
    console.log('get feed');
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const article = await this.articleService.getBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    return this.articleService.buildArticleResponse(article);
  }
  get() {
    return { ok: 'get' };
  }

  @Post()
  // @UseGuards(AuthGuard)
  // @UsePipes(new ValidationPipe())
  @UsePipes(new BackendValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ) {
    console.log('here1');
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async delete(@User('id') userId: number, @Param('slug') slug: string) {
    const article = await this.articleService.getBySlug(slug);
    if (!article) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (article.authorId !== userId) {
      throw new HttpException('Not Auth', HttpStatus.UNAUTHORIZED);
    }
    return await this.articleService.delete(slug);
  }
  @Put(':slug')
  @UseGuards(AuthGuard)
  // @UsePipes(new ValidationPipe())
  @UsePipes(new BackendValidationPipe())
  async update(
    @Param('slug') slug: string,
    @User('id') userId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ) {
    // throw new HttpException('in', HttpStatus.ACCEPTED);
    const article = await this.articleService.getBySlug(slug);
    if (!article) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (article.authorId !== userId) {
      throw new HttpException('Not Auth', HttpStatus.UNAUTHORIZED);
    }
    return await this.articleService.update(slug, updateArticleDto);
  }
  @UseGuards(AuthGuard)
  @Post(':slug/favorite')
  async addArticleToFavorites(
    @User('id') currentuserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentuserId,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @UseGuards(AuthGuard)
  @Delete(':slug/favorite')
  async deleteArticleToFavorites(
    @User('id') currentuserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      currentuserId,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
