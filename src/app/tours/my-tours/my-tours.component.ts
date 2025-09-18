import { Component, OnDestroy, OnInit } from '@angular/core';
import { Tour } from '../../shared/models/tour.model';
import { TourService } from '../tour.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

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
  errorMessage: string | null = null;

  constructor(private tourService: TourService,
    private authService: AuthService,
    private router: Router) { }

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
          this.tours = data.map(tour => ({
            ...tour,
            id: tour.ID
          }));
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    } else if (role === 'tourist') {
      this.tourService.getAllPublishedTours().subscribe({
        next: (data: any[]) => {
          this.tours = data.map(tour => ({
            ...tour,
            id: tour.ID
          }));
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    } else {
      this.tours = [];
    }
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

  startTourExecution(tour: Tour) {
    if (!tour.id) {
      return;
    }

    this.router.navigate(['/position-simulator'], { queryParams: { tourId: tour.id } });
  }
  
  getTransportationIcon(transportation: string | undefined): string {
    switch (transportation) {
      case 'Walking': return 'fa-solid fa-person-walking';
      case 'Bicycle': return 'fa-solid fa-bicycle';
      case 'Car': return 'fa-solid fa-car';
      default: return '';
    }
  }

  publishTour(tour: Tour): void {
  if (!tour.id) return;
  this.tourService.publishTour(tour.id).subscribe({
    next: (updatedTour) => {
      tour.status = updatedTour.status;
    },
    error: (err) => {
      console.error('Error publishing tour:', err);
      const message = err.error?.error || "Greška prilikom objavljivanja ture.";
      alert(message);  
    }
  });
}


  archiveTour(tour: Tour): void {
    if (!tour.id) return;
    this.tourService.archiveTour(tour.id).subscribe({
      next: (updatedTour) => {
        tour.status = updatedTour.status;
      },
      error: (err) => console.error('Error archiving tour:', err)
    });
  }

  unarchiveTour(tour: Tour): void {
    if (!tour.id) return;
    this.tourService.unarchiveTour(tour.id).subscribe({
      next: (updatedTour) => {
        tour.status = updatedTour.status;
      },
      error: (err) => console.error('Error unarchiving tour:', err)
    });
  }

}