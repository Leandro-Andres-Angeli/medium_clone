import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// import { DataSource } from 'typeorm';

// @Global()
// @Module({
//   imports: [],
//   providers: [],
//   exports: [
//     TypeOrmModule.forRootAsync({
//       useFactory: () => {
//         return {
//           type: 'postgres',
//           host: 'localhost',
//           port: 5432,
//           username: 'postgres',
//           password: 'root',
//           database: 'mediumclone',
//           synchronize: true,
//           // entities: [`${__dirname}/**/**.entity{.ts,.js}`],

//           // '/**/*.entity{.ts,.js}' - gets all file in your project
//           // that have .entity.ts or entity.js end.

//           logging: true,
//         };
//       },
//     }),
//   ],
// })
//export class TypeOrmModuleConfig {}
@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'root',
            database: 'mediumclone',
            synchronize: true,
            entities: [`${__dirname}/**/**.entity{.ts,.js}`],
            // this will automatically load all entity file in the src folder
          });
          await dataSource.initialize(); // initialize the data source
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log(error);
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModuleConfig {}
