import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecommendedResponse } from '../profile/model/recommended-response.model';

@Injectable({
  providedIn: 'root',
})
export class FollowerService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  follow(username: string): Observable<any> {
    console.log(username)
    return this.http.post(`${this.apiUrl}/follow`, { to: username });
  }

  // Poziv za prestanak praćenja. Korišćenje body-ja u DELETE zahtevu je
  // nestandardno, ali radi na nekim serverima. Preporuka je da se promeni na
  // `DELETE /unfollow/:username` ako je to moguće u API Gateway-u.
  // Za sada, ostavljamo vašu originalnu implementaciju.
  unfollow(username: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/follow/${username}`);
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