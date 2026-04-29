import { Component, inject, signal } from '@angular/core';
import { MarketDataService } from '../../../../core/services/market-data.service';
import { MarketQuote } from '../../../../core/models/market-data.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly marketDataService = inject(MarketDataService);

  testQuote = signal<MarketQuote | null>(null);
  testLoading = signal(false);
  testError = signal('');

  loadTestQuote(): void {
    this.testLoading.set(true);
    this.testError.set('');

    this.marketDataService.getQuote('AAPL').subscribe({
      next: (quote) => {
        this.testQuote.set(quote);
        this.testLoading.set(false);
      },
      error: () => {
        this.testError.set('Could not load AAPL quote from Twelve Data.');
        this.testLoading.set(false);
      },
    });
  }
}
