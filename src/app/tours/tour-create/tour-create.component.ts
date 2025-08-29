import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { TourService } from '../tour.service';
import { Tour } from '../../shared/models/tour.model';
import { KeypointCreateComponent } from '../keypoint-create/keypoint-create.component';
import { Keypoint } from '../../shared/models/keypoint.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tour-create',
  imports: [FormsModule, CommonModule, KeypointCreateComponent],
  templateUrl: './tour-create.component.html',
  styleUrl: './tour-create.component.css'
})
export class TourCreateComponent {

  name: string = '';
  description: string = '';
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';
  tags: string[] = [];
  newTag: string = '';
  keypoints: Keypoint[] = [];
  removeRequests = new Subject<Keypoint>();

  constructor(private http: HttpClient,
    private tourService: TourService
  ) {}

  addTag() {
    if (this.newTag.trim() && !this.tags.includes(this.newTag)) {
      this.tags.push(this.newTag.trim());
      this.newTag = "";
    }    
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  removeKeypoint(kp: Keypoint) {
    this.keypoints = this.keypoints.filter(t => t !== kp);
    this.removeRequests.next(kp);
  }

  submitForm() {
    const formData = new FormData();

    formData.append("name", this.name);
    formData.append("description", this.description);
    formData.append("difficulty", this.difficulty);
    formData.append("tags", JSON.stringify(this.tags));
    formData.append("keypoints", JSON.stringify(this.keypoints.map((kp, i) => ({
      name: kp.name,
      description: kp.description,
      latitude: kp.latitude,
      longitude: kp.longitude
    }))));

    this.keypoints.forEach((kp, i) => {
      if (kp.image) {
        formData.append(`image${i}`, kp.image);
      }
    });

    this.tourService.createTour(formData).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err.message);
      }
    });
  }

  onKeypointsDone(points: any[]) {
    this.keypoints = points;
  }
}
