import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MarketDataService } from '../../../../core/services/market-data.service';
import { WatchlistService } from '../../../../core/services/watchlist.service';
import { SymbolSearchItem } from '../../../../core/models/market-data.model';
import { WatchlistItem } from '../../../../core/models/watchlist.model';

@Component({
  selector: 'app-watchlist',
  imports: [FormsModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss',
})
export class WatchlistComponent {
  private readonly marketDataService = inject(MarketDataService);
  private readonly watchlistService = inject(WatchlistService);

  watchlist = this.watchlistService.items;

  searchTerm = '';
  searchResults = signal<SymbolSearchItem[]>([]);
  searchLoading = signal(false);
  searchError = signal('');

  ngOnInit(): void {
    this.refreshAllQuotes();
  }

  searchSymbols(): void {
    const query = this.searchTerm.trim();

    if (!query) {
      this.searchResults.set([]);
      this.searchError.set('Type a symbol or company name.');
      return;
    }

    this.searchLoading.set(true);
    this.searchError.set('');

    this.marketDataService.searchSymbols(query).subscribe({
      next: (response) => {
        this.searchResults.set(response.data || []);
        this.searchLoading.set(false);

        if (!response.data?.length) {
          this.searchError.set('No instruments found.');
        }
      },
      error: () => {
        this.searchError.set('Could not search symbols.');
        this.searchLoading.set(false);
      },
    });
  }

  addToWatchlist(result: SymbolSearchItem): void {
    const item: WatchlistItem = {
      symbol: result.symbol,
      name: result.instrument_name,
      exchange: result.exchange,
      currency: result.currency,
      instrumentType: result.instrument_type,
      loading: true,
    };

    this.watchlistService.addItem(item);
    this.loadQuote(result.symbol);
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlistService.removeItem(symbol);
  }

  refreshAllQuotes(): void {
    const items = this.watchlist();

    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      this.watchlistService.updateItem(item.symbol, {
        loading: true,
        error: '',
      });
    });

    const requests = items.map((item) =>
      this.marketDataService.getQuote(item.symbol),
    );

    forkJoin(requests).subscribe({
      next: (quotes) => {
        quotes.forEach((quote) => {
          this.watchlistService.updateItem(quote.symbol, {
            close: quote.close,
            change: quote.change,
            percentChange: quote.percent_change,
            isMarketOpen: quote.is_market_open,
            loading: false,
            error: '',
          });
        });
      },
      error: () => {
        items.forEach((item) => {
          this.watchlistService.updateItem(item.symbol, {
            loading: false,
            error: 'Could not refresh quote.',
          });
        });
      },
    });
  }

  private loadQuote(symbol: string): void {
    this.marketDataService.getQuote(symbol).subscribe({
      next: (quote) => {
        this.watchlistService.updateItem(symbol, {
          close: quote.close,
          change: quote.change,
          percentChange: quote.percent_change,
          isMarketOpen: quote.is_market_open,
          loading: false,
          error: '',
        });
      },
      error: () => {
        this.watchlistService.updateItem(symbol, {
          loading: false,
          error: 'Quote unavailable.',
        });
      },
    });
  }
}
