import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecommendedResponse } from '../profile/model/recommended-response.model';

@Injectable({
  providedIn: 'root',
})
export class FollowerService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  follow(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/follow`, { to: username });
  }

  unfollow(username: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/follow`, {
      body: { to: username },
    });
  }

  getFollowing(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/following/${username}`);
  }

  getFollowers(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/followers/${username}`);
  }

  getRecommendations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recommend`);
  }
}
