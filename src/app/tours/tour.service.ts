import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Tour } from '../shared/models/tour.model';
import { Review } from '../shared/models/review.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/api/tours'
  private reviewApiUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) { }

  public createTour(data: FormData): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, data);
  }

  public getAllTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }
  getAllPublishedTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/published`);
  }
  public createReview(data: FormData): Observable<any> {
    return this.http.post(this.reviewApiUrl, data);
  }
  public getReviewsByTourId(tourId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${tourId}/reviews`);
  }
  
}
