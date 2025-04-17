import { Injectable, Logger } from '@nestjs/common';
import { Pool, Client } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DbService {
  public db: any;

  constructor() {
    // const pool = new Pool({
    //   connectionString: process.env.DATABASE_URL,
    // });
    // this.db = pgDrizzle(pool, { schema });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    // Extract database name from URL
    const dbName = databaseUrl.split('/').pop()?.split('?')[0];
    if (!dbName) {
      throw new Error('Invalid DATABASE_URL format');
    }

    // Connect to default 'postgres' database to check/create 'fundmaker'
    const defaultUrl = databaseUrl.replace(dbName, 'postgres');
    const client = new Client({ connectionString: defaultUrl });

    try {
      await client.connect();
      const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      );
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE ${dbName}`);
      } 
    } catch (error) {
      throw error;
    } finally {
      await client.end();
    }

    // Initialize Drizzle ORM with the fundmaker database
    const pool = new Pool({ connectionString: databaseUrl });
    this.db = pgDrizzle(pool, { schema });
  }

  getDb() {
    return this.db;
  }
}