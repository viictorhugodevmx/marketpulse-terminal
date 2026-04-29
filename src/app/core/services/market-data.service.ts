import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  MarketQuote,
  SymbolSearchResponse,
  TimeSeriesResponse,
} from '../models/market-data.model';

@Injectable({
  providedIn: 'root',
})
export class MarketDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.twelveDataBaseUrl;
  private readonly apiKey = environment.twelveDataApiKey;

  getQuote(symbol: string): Observable<MarketQuote> {
    const params = this.buildParams({
      symbol,
    });

    return this.http.get<MarketQuote>(`${this.baseUrl}/quote`, { params });
  }

  searchSymbols(query: string): Observable<SymbolSearchResponse> {
    const params = this.buildParams({
      symbol: query,
      outputsize: '8',
    });

    return this.http.get<SymbolSearchResponse>(`${this.baseUrl}/symbol_search`, {
      params,
    });
  }

  getTimeSeries(
    symbol: string,
    interval = '1day',
    outputsize = 30,
  ): Observable<TimeSeriesResponse> {
    const params = this.buildParams({
      symbol,
      interval,
      outputsize: String(outputsize),
    });

    return this.http.get<TimeSeriesResponse>(`${this.baseUrl}/time_series`, {
      params,
    });
  }

  private buildParams(params: Record<string, string>): HttpParams {
    let httpParams = new HttpParams().set('apikey', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, value);
    });

    return httpParams;
  }
}
