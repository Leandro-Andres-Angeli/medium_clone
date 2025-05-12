import { UserEntity } from 'src/user/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'articles' })
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  slug: string;
  @Column()
  title: string;
  @Column({ default: '' })
  description: string;
  @Column({ default: '' })
  body: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  @Column('simple-array')
  tagsList: string[];
  @Column({ default: 0 })
  favoritesCount: number;
  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date();
  }
  @Column({ name: 'author_id' })
  authorId: number;
  @ManyToOne(() => UserEntity, (user) => user.articles)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;
}
