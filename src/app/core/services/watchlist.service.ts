import { Injectable, signal } from '@angular/core';
import { WatchlistItem } from '../models/watchlist.model';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private readonly storageKey = 'marketpulse_watchlist';

  items = signal<WatchlistItem[]>(this.getStoredItems());

  addItem(item: WatchlistItem): void {
    const exists = this.items().some(
      (current) => current.symbol.toLowerCase() === item.symbol.toLowerCase(),
    );

    if (exists) {
      return;
    }

    const updatedItems = [...this.items(), item];
    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  removeItem(symbol: string): void {
    const updatedItems = this.items().filter(
      (item) => item.symbol.toLowerCase() !== symbol.toLowerCase(),
    );

    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  updateItem(symbol: string, changes: Partial<WatchlistItem>): void {
    const updatedItems = this.items().map((item) => {
      if (item.symbol.toLowerCase() !== symbol.toLowerCase()) {
        return item;
      }

      return {
        ...item,
        ...changes,
      };
    });

    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem(this.storageKey);
  }

  private getStoredItems(): WatchlistItem[] {
    const rawItems = localStorage.getItem(this.storageKey);

    if (!rawItems) {
      return [];
    }

    try {
      return JSON.parse(rawItems) as WatchlistItem[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private persist(items: WatchlistItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
