import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DbService {
  public db: any;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = pgDrizzle(pool, { schema });
  }

  getDb() {
    return this.db;
  }
}