import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly API_URL = 'http://localhost:8080/api/auth';

  private roleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<{ token: string }>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.setUserRoleFromToken();
        })
      );
  }
  register(data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.clearRole();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    console.log(token)
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  setUserRoleFromToken() {
    this.roleSubject.next(this.getUserRole());
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch (err) {
      console.error('Failed to decode JWT for username', err);
      return null;
    }
  }

  clearRole() {
    this.roleSubject.next(null);
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(payload.userId);
      return payload.userId || null;
    } catch (err) {
      console.error('Failed to decode JWT for userId', err);
      return null;
    }
  }
}
