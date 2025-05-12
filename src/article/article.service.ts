import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './articleEntity.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './createArticleDto';
import { UserEntity } from 'src/user/user.entity';
import { ArticleResponse } from './types/articleResponse';
import slugify from 'slugify';
import { UpdateArticleDto } from './updateArticleDto';
import { QueryType } from './types/query';
import { ArticleType } from './types/articleType';
import FollowEntity from 'src/profile/follower';
import { ArticlesResponseInterface } from './types/articlesResponseInterface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findAll(currentUserId: number, query: QueryType) {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');
    if (query.tag) {
      queryBuilder.andWhere('articles.tagsList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    if (query.authorId) {
      const author = await this.userRepository.findOneBy({
        id: query.authorId,
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author?.id,
      });
    }
    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });
      let ids: number[] = [];
      if (author) {
        ids = author?.favorites.map((el) => el.id);
      }
      console.log(author);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();
    if (query.limit) {
      console.log('limit', query.limit);
      queryBuilder.limit(Number(query.limit));
    }
    if (query.offset) {
      queryBuilder.offset(Number(query.offset));
    }
    let favoritedIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      if (currentUser) {
        favoritedIds = currentUser?.favorites.map((el) => el.id);
      }
    }
    const articles = await queryBuilder.getMany();
    const articlesWithFavorites: ArticleType[] = articles.map((article) => {
      const favorited = favoritedIds.includes(article.id);
      return { ...article, favorited };
    });
    return { articles: articlesWithFavorites, articlesCount };
  }
  async getFeed(
    currentUserId: number,
    query: { offset?: number; limit?: number },
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }
    const followingUserIds = follows.map((follow) => follow.followingId);
    console.log('ids ', followingUserIds);
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .andWhere('articles.authorId IN (:...ids)', { ids: followingUserIds });
    queryBuilder.orderBy('articles.createdAt', 'DESC');
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();
    return { articles, articlesCount };
  }
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article: ArticleEntity = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagsList) {
      article.tagsList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponse {
    return { article };
  }
  private getSlug(title: string) {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
  async getBySlug(slug: string) {
    return await this.articleRepository.findOneBy({
      slug: slug,
    });
  }
  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    if (!article) {
      throw new HttpException('Not Found ', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const isNotFavorited =
      user?.favorites.findIndex((favorites) => favorites.id === article.id) ===
      -1;
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
  async deleteArticleFromFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    if (!article) {
      throw new HttpException('Not Found ', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    if (!user) {
      throw new HttpException('Not Found ', HttpStatus.NOT_FOUND);
    }
    const articleIndex = user.favorites.findIndex(
      (favorites) => favorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
  async delete(slug: string) {
    return await this.articleRepository.delete({ slug });
  }
  async update(slug: string, updateArticleDto: UpdateArticleDto) {
    await this.articleRepository.update({ slug }, updateArticleDto);
    return await this.getBySlug(slug);
  }
}
