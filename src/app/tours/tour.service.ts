import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Tour } from '../shared/models/tour.model';
import { Review } from '../shared/models/review.model';
import { Keypoint } from '../shared/models/keypoint.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/api/tours'
  private reviewApiUrl = 'http://localhost:8080/api/reviews';
  private keypointApiUrl = 'http://localhost:8080/api/keypoints';

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
   public getKeyPointsByTourId(tourId: string): Observable<Keypoint[]> {
    return this.http.get<Keypoint[]>(`${this.apiUrl}/${tourId}/keypoints`);
  }

  public createKeypoint(keypoint: FormData): Observable<Keypoint> {
    return this.http.post<Keypoint>(this.keypointApiUrl, keypoint);
  }

  public updateKeypoint(keypointId: string, keypointData: Partial<Keypoint>): Observable<Keypoint> {
    return this.http.put<Keypoint>(`${this.keypointApiUrl}/${keypointId}`, keypointData);
  }

  public deleteKeypoint(keypointId: string): Observable<any> {
    return this.http.delete<any>(`${this.keypointApiUrl}/${keypointId}`);
  }
  public updateKeypointWithFormData(keypointId: string, formData: FormData): Observable<Keypoint> {
  return this.http.put<Keypoint>(`${this.keypointApiUrl}/${keypointId}`, formData);
}
  
}
