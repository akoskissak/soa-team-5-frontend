import { Component } from '@angular/core';
import { Profile } from './model/profile.model';
import { ProfileService } from '../core/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  profile: Profile | undefined

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(data => {
      this.profile = data;
      console.log(this.profile);
    })
  }
}
