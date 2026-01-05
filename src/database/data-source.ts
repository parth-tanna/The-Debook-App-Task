import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'debookchallengedb',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Always use migrations in production
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
