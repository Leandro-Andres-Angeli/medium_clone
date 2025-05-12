import { ArticleEntity } from '../articleEntity.entity';

export type ArticleType = Omit<ArticleEntity, 'updateTimeStamp'>;
