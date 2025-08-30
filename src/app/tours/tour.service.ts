import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Tour } from '../shared/models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8083/api/tours'

  constructor(private http: HttpClient) { }

  public createTour(data: FormData): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, data);
  }

  public getAllTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }
}
