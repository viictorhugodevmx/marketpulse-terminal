import { Injectable, computed, signal } from '@angular/core';
import { PortfolioPosition } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private readonly storageKey = 'marketpulse_portfolio';

  positions = signal<PortfolioPosition[]>(this.getStoredPositions());

  totalCost = computed(() =>
    this.positions().reduce((total, position) => {
      return total + position.quantity * position.averagePrice;
    }, 0),
  );

  totalMarketValue = computed(() =>
    this.positions().reduce((total, position) => {
      const price = position.currentPrice || position.averagePrice;
      return total + position.quantity * price;
    }, 0),
  );

  totalPnl = computed(() => this.totalMarketValue() - this.totalCost());

  totalPnlPercent = computed(() => {
    const cost = this.totalCost();

    if (!cost) {
      return 0;
    }

    return (this.totalPnl() / cost) * 100;
  });

  addPosition(position: Omit<PortfolioPosition, 'id'>): void {
    const newPosition: PortfolioPosition = {
      ...position,
      id: crypto.randomUUID(),
    };

    const updatedPositions = [...this.positions(), newPosition];

    this.positions.set(updatedPositions);
    this.persist(updatedPositions);
  }

  removePosition(id: string): void {
    const updatedPositions = this.positions().filter((position) => position.id !== id);

    this.positions.set(updatedPositions);
    this.persist(updatedPositions);
  }

  updatePosition(id: string, changes: Partial<PortfolioPosition>): void {
    const updatedPositions = this.positions().map((position) => {
      if (position.id !== id) {
        return position;
      }

      return {
        ...position,
        ...changes,
      };
    });

    this.positions.set(updatedPositions);
    this.persist(updatedPositions);
  }

  clear(): void {
    this.positions.set([]);
    localStorage.removeItem(this.storageKey);
  }

  private getStoredPositions(): PortfolioPosition[] {
    const rawPositions = localStorage.getItem(this.storageKey);

    if (!rawPositions) {
      return [];
    }

    try {
      return JSON.parse(rawPositions) as PortfolioPosition[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private persist(positions: PortfolioPosition[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(positions));
  }
}
