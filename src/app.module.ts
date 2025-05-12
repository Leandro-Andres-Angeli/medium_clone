import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { TagModule } from './tag/tag.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ArticleModule } from './article/article.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TagModule,
    ArticleModule,
    UserModule,

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // console.log(__dirname)
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'root',
          database: 'mediumclone',
          synchronize: true,
          autoLoadEntities: true,
          // logging: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          //entities: [TagEntity],

          // '/**/*.entity{.ts,.js}' - gets all file in your project
          // that have .entity.ts or entity.js end.
        };
      },
    }),
    UserModule,
    ArticleModule,
    ProfileModule,
  ],
  // controllers: [AppController],
  // providers: [AppService ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
