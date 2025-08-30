import { Component } from '@angular/core';
import { Tour } from '../../shared/models/tour.model';
import { TourService } from '../tour.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-tours.component',
  imports: [CommonModule],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent {

  tours: Tour[] = [];

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.fetchTours();
  }

  fetchTours(): void {
    this.tourService.getAllTours().subscribe({
      next: (data: Tour[]) => {
        this.tours = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
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
