import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MarketQuote,
  TimeSeriesValue,
} from '../../../../core/models/market-data.model';
import { MarketDataService } from '../../../../core/services/market-data.service';

interface ChartPoint {
  x: number;
  y: number;
  close: string;
  date: string;
}

@Component({
  selector: 'app-instrument-detail',
  imports: [RouterLink],
  templateUrl: './instrument-detail.component.html',
  styleUrl: './instrument-detail.component.scss',
})
export class InstrumentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly marketDataService = inject(MarketDataService);

  symbol = signal('');
  quote = signal<MarketQuote | null>(null);
  history = signal<TimeSeriesValue[]>([]);

  loading = signal(false);
  errorMessage = signal('');

  latestClose = computed(() => this.quote()?.close || 'N/A');
  percentChange = computed(() => this.quote()?.percent_change || 'N/A');
  isNegative = computed(() => this.percentChange().startsWith('-'));
  isPositive = computed(() => {
    const value = this.percentChange();

    return value !== 'N/A' && !value.startsWith('-');
  });

  chartPoints = computed<ChartPoint[]>(() => {
    const rows = [...this.history()].reverse();
    const closes = rows
      .map((row) => Number(row.close))
      .filter((value) => Number.isFinite(value));

    if (rows.length < 2 || closes.length < 2) {
      return [];
    }

    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    return rows.map((row, index) => {
      const close = Number(row.close);
      const x = (index / (rows.length - 1)) * 100;
      const y = 90 - ((close - min) / range) * 72;

      return {
        x,
        y,
        close: row.close,
        date: row.datetime,
      };
    });
  });

  chartPath = computed(() => {
    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    return points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x} ${point.y}`;
      })
      .join(' ');
  });

  chartMin = computed(() => {
    const values = this.history()
      .map((row) => Number(row.close))
      .filter((value) => Number.isFinite(value));

    return values.length ? Math.min(...values).toFixed(2) : 'N/A';
  });

  chartMax = computed(() => {
    const values = this.history()
      .map((row) => Number(row.close))
      .filter((value) => Number.isFinite(value));

    return values.length ? Math.max(...values).toFixed(2) : 'N/A';
  });

  ngOnInit(): void {
    const symbol = this.route.snapshot.paramMap.get('symbol') || '';

    this.symbol.set(symbol);
    this.loadInstrument(symbol);
  }

  reload(): void {
    this.loadInstrument(this.symbol());
  }

  private loadInstrument(symbol: string): void {
    if (!symbol) {
      this.errorMessage.set('Missing instrument symbol.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      quote: this.marketDataService.getQuote(symbol),
      history: this.marketDataService.getTimeSeries(symbol, '1day', 30),
    }).subscribe({
      next: ({ quote, history }) => {
        this.quote.set(quote);
        this.history.set(history.values || []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load instrument detail.');
        this.loading.set(false);
      },
    });
  }
}
