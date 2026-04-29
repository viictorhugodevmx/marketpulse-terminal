import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketDataService } from '../../../../core/services/market-data.service';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { PortfolioPosition } from '../../../../core/models/portfolio.model';

@Component({
  selector: 'app-portfolio',
  imports: [FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly marketDataService = inject(MarketDataService);

  positions = this.portfolioService.positions;

  symbol = 'AAPL';
  quantity: number | null = 10;
  averagePrice: number | null = 150;

  formError = signal('');
  formLoading = signal(false);

  totalCost = this.portfolioService.totalCost;
  totalMarketValue = this.portfolioService.totalMarketValue;
  totalPnl = this.portfolioService.totalPnl;
  totalPnlPercent = this.portfolioService.totalPnlPercent;

  hasPositions = computed(() => this.positions().length > 0);

  addPosition(): void {
    const cleanSymbol = this.symbol.trim().toUpperCase();

    if (!cleanSymbol || !this.quantity || !this.averagePrice) {
      this.formError.set('Symbol, quantity and average price are required.');
      return;
    }

    if (this.quantity <= 0 || this.averagePrice <= 0) {
      this.formError.set('Quantity and average price must be greater than zero.');
      return;
    }

    this.formLoading.set(true);
    this.formError.set('');

    this.marketDataService.getQuote(cleanSymbol).subscribe({
      next: (quote) => {
        this.portfolioService.addPosition({
          symbol: quote.symbol || cleanSymbol,
          name: quote.name,
          quantity: Number(this.quantity),
          averagePrice: Number(this.averagePrice),
          currentPrice: Number(quote.close || this.averagePrice),
          currency: quote.currency,
          loading: false,
          error: '',
        });

        this.symbol = '';
        this.quantity = null;
        this.averagePrice = null;
        this.formLoading.set(false);
      },
      error: () => {
        this.formError.set('Could not load symbol quote. Try another symbol.');
        this.formLoading.set(false);
      },
    });
  }

  refreshPrices(): void {
    this.positions().forEach((position) => {
      this.portfolioService.updatePosition(position.id, {
        loading: true,
        error: '',
      });

      this.marketDataService.getQuote(position.symbol).subscribe({
        next: (quote) => {
          this.portfolioService.updatePosition(position.id, {
            currentPrice: Number(quote.close || position.currentPrice || position.averagePrice),
            name: quote.name || position.name,
            currency: quote.currency || position.currency,
            loading: false,
            error: '',
          });
        },
        error: () => {
          this.portfolioService.updatePosition(position.id, {
            loading: false,
            error: 'Quote unavailable.',
          });
        },
      });
    });
  }

  removePosition(id: string): void {
    this.portfolioService.removePosition(id);
  }

  getMarketValue(position: PortfolioPosition): number {
    const price = position.currentPrice || position.averagePrice;
    return position.quantity * price;
  }

  getCost(position: PortfolioPosition): number {
    return position.quantity * position.averagePrice;
  }

  getPnl(position: PortfolioPosition): number {
    return this.getMarketValue(position) - this.getCost(position);
  }

  getPnlPercent(position: PortfolioPosition): number {
    const cost = this.getCost(position);

    if (!cost) {
      return 0;
    }

    return (this.getPnl(position) / cost) * 100;
  }

  formatMoney(value: number): string {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}
