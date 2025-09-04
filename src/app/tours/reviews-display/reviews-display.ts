import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../tour.service';
import { ActivatedRoute } from '@angular/router';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-reviews-display',
  imports: [CommonModule],
  templateUrl: './reviews-display.html',
  styleUrl: './reviews-display.css'
})
export class ReviewsDisplay implements OnInit{
  reviews: Review[] = [];
  tourId: string | null = null;
  isLoading = true;
  selectedImageUrl: string | null = null;
  isModalOpen = false;

  constructor(private tourService: TourService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('tourId');
    if (this.tourId) {
      this.tourService.getReviewsByTourId(this.tourId).subscribe({
        next: (data: Review[]) => {
          console.log('Sirovi podaci sa bekenda:', data);
          this.reviews = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load reviews:', err);
          this.isLoading = false;
        }
      });
    }
  }
   openImageModal(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
    console.log('Otvaranje modalnog prozora za sliku:', imageUrl);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedImageUrl = null;
  }
}
