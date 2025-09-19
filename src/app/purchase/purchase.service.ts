// src/app/purchase/purchase.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { Tour } from '../shared/models/tour.model';
import { OrderItemCreate, ShoppingCart, TourPurchaseToken } from '../shared/models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  
  private purchaseServiceUrl = 'http://localhost:8080/api'; // API Gateway URL

  constructor(private http: HttpClient, private authService: AuthService) { }

  createShoppingCart(touristId: string): Observable<ShoppingCart> {
    return this.http.post<ShoppingCart>(`${this.purchaseServiceUrl}/shopping-cart/${touristId}`, {});
  }

  addToCart(tour: Tour): Observable<ShoppingCart> {
        const touristId = this.authService.getUserId();

        if (!touristId) {
            return throwError(() => new Error("User not logged in"));
        }

        const item : OrderItemCreate = {
            tour_id: tour.id,
            tour_name: tour.name,
            price: tour.price
        };

        return this.http.post<ShoppingCart>(`${this.purchaseServiceUrl}/shopping-cart/${touristId}/items`, item);
  }

   getShoppingCart(touristId: string): Observable<ShoppingCart> {
    return this.http.get<ShoppingCart>(`${this.purchaseServiceUrl}/shopping-cart/${touristId}`);
  }

  removeItemFromCart(touristId: string, tourId: string): Observable<any> {
    return this.http.delete(`${this.purchaseServiceUrl}/shopping-cart/${touristId}/items/${tourId}`, { responseType: 'text' });
  }

  checkout(touristId: string): Observable<TourPurchaseToken[]> {
    return this.http.post<TourPurchaseToken[]>(`${this.purchaseServiceUrl}/shopping-cart/${touristId}/checkout`, {});
  }

  getPurchasedTours(touristId: string): Observable<TourPurchaseToken[]> {
  const url = `${this.purchaseServiceUrl}/tourist/${touristId}/purchases`;
    return this.http.get<TourPurchaseToken[]>(url);
  }
}