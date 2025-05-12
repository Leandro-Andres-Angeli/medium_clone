import { ArticleType } from './articleType';

export interface ArticlesResponseInterface {
  articles: ArticleType[];
  articlesCount: number;
}
