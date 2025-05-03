import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getConfigDB(configService: ConfigService): Promise<TypeOrmModuleOptions> {
  while (!process.env.DB_HOST) {
    Logger.log('Waiting for DATABASE_HOST to be defined...', process.env.NODE_ENV);
    await delay(1000);
  }

  const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'thinker.cp0swoc6k3dm.us-east-2.rds.amazonaws.com',
    port: 5432,
    username: 'postgres',
    password: 'Yona-Shloimy',
    database: 'thinker',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [path.join(__dirname, '../database/migration/*.ts')],
    synchronize: false,
    // logging: ["query", "error", "schema", "warn", "info", "log"],
    // logger: "advanced-console",
    verboseRetryLog: true,
    ssl: {
      ca: fs.readFileSync(path.join(process.cwd(), 'certs/us-east-2-bundle.pem')),
      rejectUnauthorized: true,
    },
  };
  return typeOrmConfig;
}

export default getConfigDB;
