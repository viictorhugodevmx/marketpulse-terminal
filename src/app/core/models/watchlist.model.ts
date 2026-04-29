export interface WatchlistItem {
  symbol: string;
  name: string;
  exchange?: string;
  currency?: string;
  instrumentType?: string;
  close?: string;
  change?: string;
  percentChange?: string;
  isMarketOpen?: boolean;
  loading?: boolean;
  error?: string;
}
