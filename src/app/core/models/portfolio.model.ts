export interface PortfolioPosition {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currency?: string;
  loading?: boolean;
  error?: string;
}
