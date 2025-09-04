import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TourService } from '../tour.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css']
})
export class ReviewFormComponent implements OnInit {
  tourId: string | null = null;
  rating: number | null = null;
  comment: string = '';
  visitedDate: string = '';
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private tourService: TourService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('tourId');
  }

onFileChange(event: any): void {
  
  if (event.target.files) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  event.target.value = '';
}

  onSubmit(): void {
    if (!this.rating || !this.visitedDate || !this.tourId) {
      console.error('All required fields must be filled.');
      return;
    }

    const formData = new FormData();
    formData.append('tourId', this.tourId);
    formData.append('rating', this.rating.toString());
    formData.append('comment', this.comment);
    formData.append('visitedDate', this.visitedDate);

    this.selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.tourService.createReview(formData).subscribe({
      next: (response) => {
        console.log('Review submitted successfully!', response);
        this.router.navigate(['/tours']);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tours']);
  }
}