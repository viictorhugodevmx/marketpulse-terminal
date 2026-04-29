export interface MarketQuote {
  symbol: string;
  name?: string;
  exchange?: string;
  mic_code?: string;
  currency?: string;
  datetime?: string;
  timestamp?: number;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  average_volume?: string;
  is_market_open?: boolean;
}

export interface SymbolSearchItem {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code: string;
  exchange_timezone: string;
  instrument_type: string;
  country: string;
  currency: string;
}

export interface SymbolSearchResponse {
  data: SymbolSearchItem[];
  status: string;
}

export interface TimeSeriesValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

export interface TimeSeriesMeta {
  symbol: string;
  interval: string;
  currency?: string;
  exchange_timezone?: string;
  exchange?: string;
  mic_code?: string;
  type?: string;
}

export interface TimeSeriesResponse {
  meta: TimeSeriesMeta;
  values: TimeSeriesValue[];
  status: string;
}

export interface TwelveDataError {
  code?: number;
  message?: string;
  status?: string;
}
