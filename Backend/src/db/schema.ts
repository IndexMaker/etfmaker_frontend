import {
  pgTable,
  serial,
  varchar,
  decimal,
  timestamp,
  jsonb,
  bigint,
  text,
} from 'drizzle-orm/pg-core';

export const compositions = pgTable('compositions', {
  id: serial('id').primaryKey(),
  indexId: varchar('index_id', { length: 66 }).notNull(),
  tokenAddress: varchar('token_address', { length: 66 }).notNull(),
  weight: decimal('weight', { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rebalances = pgTable('rebalances', {
  id: serial('id').primaryKey(),
  indexId: varchar('index_id', { length: 66 }).notNull(),
  weights: text('weights').notNull(), // Store as hex string
  prices: jsonb('prices').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userActivities = pgTable('user_activities', {
  id: serial('id').primaryKey(),
  indexId: varchar('index_id', { length: 66 }).notNull(),
  userAddress: varchar('user_address', { length: 66 }).notNull(),
  action: varchar('action', { length: 20 }).notNull(),
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  txHash: varchar('tx_hash', { length: 66 }).notNull(),
  chainId: serial('chain_id').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const binancePairs = pgTable('binance_pairs', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 50 }).notNull(), // e.g., BTCUSDT
  quoteAsset: varchar('quote_asset', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // TRADING, BREAK, HALTED, etc.
  fetchedAt: timestamp('fetched_at').defaultNow(), // When the data was fetched
});

export const tokenMetadata = pgTable('token_metadata', {
  id: serial('id').primaryKey(),
  coinGeckoId: varchar('coin_gecko_id', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 50 }).notNull(),
  categories: jsonb('categories').notNull(), // Store as JSON array
  marketCap: bigint('market_cap', { mode: 'number' }),
  fetchedAt: timestamp('fetched_at').defaultNow(),
});
