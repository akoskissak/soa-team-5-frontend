import { Component, OnDestroy, OnInit } from '@angular/core';
import { Tour } from '../../shared/models/tour.model';
import { TourService } from '../tour.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { Route, Router, RouterModule } from '@angular/router';
import { PurchaseService } from '../../purchase/purchase.service';

@Component({
  selector: 'app-my-tours.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent implements OnInit, OnDestroy {
  tours: Tour[] = [];
  isTourist = false;
  isGuide = false;
  private roleSubscription: Subscription | undefined;
  purchasedTourIds = new Set<string>(); 

  constructor(private tourService: TourService, private authService: AuthService, private purchaseService: PurchaseService, private router: Router) {}

  ngOnInit(): void {
    this.roleSubscription = this.authService.role$.subscribe((role) => {
      this.isTourist = role === 'tourist';
      this.isGuide = role === 'guide';
      this.fetchTours(role);
    });
  }

  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe();
  }

  fetchTours(role: string | null): void {
    if (role === 'guide') {
      this.tourService.getAllTours().subscribe({
        next: (data: any[]) => {
          this.tours = data.map(tour => ({ ...tour, id: tour.ID }));
        },
        error: (err: any) => console.error(err)
      });
    } else if (role === 'tourist') {
      const touristId = this.authService.getUserId();
      if (!touristId) {
        this.tours = [];
        return;
      }

      forkJoin({
        allTours: this.tourService.getAllPublishedTours(),
        purchasedTours: this.purchaseService.getPurchasedTours(touristId).pipe(
          catchError(() => of([])) 
        )
      }).subscribe({
        next: ({ allTours, purchasedTours }) => {
          const purchasedIds = purchasedTours.map(p => p.tour_id);
          this.purchasedTourIds = new Set<string>(purchasedIds);
          this.tours = allTours.map(tour => ({ ...tour, id: tour.ID }));
        },
        error: (err: any) => {
          console.error("Failed to fetch tours data:", err);
          this.tours = [];
        }
      });

    } else {
      this.tours = [];
    }
  }

  isTourPurchased(tour: Tour): boolean {
    return this.purchasedTourIds.has(tour.ID);
  }


  statusClass(status: Tour['status']) {
    return {
      'badge': true,
      'badge-draft': status === 'Draft',
      'badge-published': status === 'Published',
    };
  }

  difficultyClass(d: Tour['difficulty']) {
    return {
      'chip': true,
      'chip-easy': d === 'Easy',
      'chip-medium': d === 'Medium',
      'chip-hard': d === 'Hard',
    };
  }

   addToCart(tour: Tour): void {
    this.purchaseService.addToCart(tour).subscribe({
      next: (response) => {
        console.log('Tour added to cart:', response);
        alert('Tura uspešno dodata u korpu!');
         this.router.navigate(['/shopping-cart']);
      },
      error: (err) => {
        console.error('Failed to add tour to cart:', err);
        alert('Greška prilikom dodavanja ture u korpu.');
      }
    });
  }
  
  startTourExecution(tour: Tour) {
    if (!tour.id) {
      return;
    }

    this.router.navigate(['/position-simulator'], { queryParams: { tourId: tour.id } });
  }
}