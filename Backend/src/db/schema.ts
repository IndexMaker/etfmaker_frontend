import {
  pgTable,
  serial,
  varchar,
  decimal,
  timestamp,
  jsonb,
  bigint,
  text,
  integer,
  doublePrecision,
  json,
  numeric,
  primaryKey,
  date,
} from 'drizzle-orm/pg-core';

export const compositions = pgTable('compositions', {
  id: serial('id').primaryKey(),
  indexId: varchar('index_id', { length: 66 }).notNull(),
  tokenAddress: varchar('token_address', { length: 66 }).notNull(),
  weight: decimal('weight', { precision: 7, scale: 4 }).notNull(),
  rebalanceTimestamp: bigint('rebalance_timestamp', {
    mode: 'number',
  }).notNull(),
  validUntil: timestamp('valid_until'),
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

export const binanceListings = pgTable('binance_listings', {
  id: serial('id').primaryKey(),
  pair: varchar('pair', { length: 20 }).notNull(), // e.g., BTCUSDT
  action: varchar('action', { length: 10 }).notNull(), // listing or delisting
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tokenOhlc = pgTable('token_ohlc', {
  id: serial('id').primaryKey(),
  coinId: varchar('coin_id', { length: 100 }).notNull(), // e.g., bitcoin
  open: decimal('open', { precision: 18, scale: 8 }).notNull(),
  high: decimal('high', { precision: 18, scale: 8 }).notNull(),
  low: decimal('low', { precision: 18, scale: 8 }).notNull(),
  close: decimal('close', { precision: 18, scale: 8 }).notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(), // Daily timestamp
  createdAt: timestamp('created_at').defaultNow(),
});

export const tokenCategories = pgTable('token_categories', {
  id: serial('id').primaryKey(),
  coinId: varchar('coin_id', { length: 100 }).notNull(),
  categories: jsonb('categories').notNull(), // Array of categories
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }).notNull(),
  websiteUrl: varchar('website_url', { length: 255 }),
  docsUrl: varchar('docs_url', { length: 255 }),
  twitterUrl: varchar('twitter_url', { length: 255 }),
  discordUrl: varchar('discord_url', { length: 255 }),
  screenshots: json('screenshots').$type<string[]>(), // Array of URLs
  overview: text('overview'),
  integrationDetails: text('integration_details'),
});

export const historicalPrices = pgTable('historical_prices', {
  id: serial('id').primaryKey(),
  coinId: text('coin_id').notNull(), // e.g., 'ethereum'
  symbol: text('symbol').notNull(), // e.g., 'ETH'
  timestamp: integer('timestamp').notNull(), // Unix timestamp (daily granularity)
  price: doublePrecision('price').notNull(), // USD price
});

export const coinSymbols = pgTable('coin_symbols', {
  symbol: text('symbol').primaryKey(),
  coinId: text('coin_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dailyPrices = pgTable(
  'daily_prices',
  {
    indexId: text('index_id').notNull(),
    date: date('date').notNull(),
    price: numeric('price').notNull(),
    quantities: jsonb('quantities'), // Store token quantities as JSON
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.indexId, table.date] }),
  }),
);
