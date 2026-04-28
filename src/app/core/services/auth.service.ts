import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'marketpulse_token';
  private readonly userKey = 'marketpulse_user';

  currentUser = signal<User | null>(this.getStoredUser());

  login(email: string, password: string): boolean {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || password.length < 4) {
      return false;
    }

    const fakeUser: User = {
      id: crypto.randomUUID(),
      name: this.getNameFromEmail(cleanEmail),
      email: cleanEmail,
      role: 'trader',
    };

    localStorage.setItem(this.tokenKey, 'fake-marketpulse-token');
    localStorage.setItem(this.userKey, JSON.stringify(fakeUser));

    this.currentUser.set(fakeUser);

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey) && this.getStoredUser());
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): User | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private getNameFromEmail(email: string): string {
    const username = email.split('@')[0] || 'Market User';

    return username
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
