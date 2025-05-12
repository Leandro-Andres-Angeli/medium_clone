import { hash } from 'bcrypt';
import { ArticleEntity } from 'src/article/articleEntity.entity';

import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: '' })
  email: string;
  @Column()
  username: string;
  @Column({ default: 'empty desc' })
  bio: string;
  @Column({ default: 'link' })
  image: string;
  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPasword() {
    const hashed = await hash(this.password, 10);
    this.password = hashed;
  }
  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles: ArticleEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];
}
