import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PurchaseService } from '../purchase.service';
import { AuthService } from '../../core/auth/auth.service';
import { TourPurchaseToken } from '../../shared/models/purchase.model';

@Component({
  selector: 'app-purchased-tours',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchased-tours.html',
  styleUrls: ['./purchased-tours.css']
})
export class PurchasedToursComponent implements OnInit {
  purchasedTours$: Observable<TourPurchaseToken[] | null> = of(null);
  isEmpty = false;
  isLoading = true;

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const touristId = this.authService.getUserId();

    if (!touristId) {
      console.warn('User not logged in. Redirecting to login page.');
      this.router.navigate(['/login']);
      return;
    }

    this.purchaseService.getPurchasedTours(touristId).subscribe({
      next: (tours) => {
        this.isLoading = false;
        if (!tours || tours.length === 0) {
          this.isEmpty = true;
          this.purchasedTours$ = of(null);
        } else {
          this.purchasedTours$ = of(tours);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load purchased tours:', err);
        this.isEmpty = true;
        this.purchasedTours$ = of(null);
      }
    });
  }
}
