import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
