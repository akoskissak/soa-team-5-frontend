import { Component, OnDestroy, OnInit } from '@angular/core';
import { Tour } from '../../shared/models/tour.model';
import { TourService } from '../tour.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

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

  constructor(private tourService: TourService, private authService: AuthService) {}

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
}