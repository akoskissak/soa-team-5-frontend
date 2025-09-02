import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../core/profile.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FollowerService } from '../core/follower.service';
import { UserProfileResponse } from './model/user-profile-response.model';
import { AuthService } from '../core/auth/auth.service';
import { RecommendedResponse } from './model/recommended-response.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profile: UserProfileResponse | undefined;
  profileForm!: FormGroup;
  editMode: boolean = false;
  selectedFileBase64: string | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  loggedInUsername: string | null = null;

  followers: string[] = [];
  following: string[] = [];
  showFollowers: boolean = false;
  showFollowing: boolean = false;

  recommendedUsers: RecommendedResponse[] = [];

  errorMessage: string | null = null;

  private backendBaseUrl = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private followerService: FollowerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username') || '';
      this.loadProfile(username);

      this.loggedInUsername = this.authService.getUsername();

      this.profileForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        profilePicture: [''],
        biography: [''],
        motto: [''],
      });
    });
  }

  loadProfile(username?: any) {
    this.profileService.getProfile(username ?? undefined).subscribe({
      next: (data) => {
        this.profile = data;
        this.errorMessage = null;
        this.profileForm.patchValue(this.profile);
        this.imagePreviewUrl = this.getAbsoluteImageUrl(
          this.profile.profilePicture
        );

        this.loadFollowers();
        this.loadFollowing();
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Unexpected error occurred';
        }
      },
    });
  }

  loadFollowers() {
    this.followerService
      .getFollowers(this.profile!.username)
      .subscribe((data) => {
        this.followers = data.followers;
        // ako followujemo onda ucitamo recommendation
        if (!this.isOwner() && this.isFollowing(this.loggedInUsername)) {
          this.loadRecommendations();
        } else {
          this.recommendedUsers = [];
        }
      });
  }

  loadFollowing() {
    this.followerService
      .getFollowing(this.profile!.username)
      .subscribe((data) => (this.following = data.following));
  }

  loadRecommendations() {
    this.followerService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendedUsers = data.recommendations;
      },
      error: (err) => console.error('Error fetching recommendations', err),
    });
  }

  toggleFollowers() {
    this.showFollowers = !this.showFollowers;
    if (this.showFollowers) {
      this.showFollowing = false;
    }
  }

  toggleFollowing() {
    this.showFollowing = !this.showFollowing;
    if (this.showFollowing) {
      this.showFollowers = false;
    }
  }

  isFollowing(username: string | null): boolean {
    if (username) return this.followers.includes(username);
    return false;
  }

  canFollow(username: string | undefined): boolean {
    return this.authService.getUsername() !== username;
  }

  toggleFollow(username: string | null) {
    if (!username) return;
    if (!this.canFollow(this.profile?.username)) return;

    if (this.isFollowing(username)) {
      this.followerService.unfollow(this.profile!.username).subscribe({
        next: () => {
          this.followers = this.followers.filter((u) => u !== username);
        },
        error: (err) => console.error('Failed to unfollow:', err),
      });
    } else {
      this.followerService.follow(this.profile!.username).subscribe({
        next: () => {
          this.followers.push(username);
        },
        error: (err) => console.error('Failed to follow:', err),
      });
    }
  }

  isOwner(): boolean {
    return this.profile?.username === this.loggedInUsername;
  }

  onEdit() {
    this.editMode = true;
    if (this.profile) {
      this.profileForm.patchValue(this.profile);
      this.imagePreviewUrl = this.getAbsoluteImageUrl(
        this.profile.profilePicture
      );
    }
    this.selectedFileBase64 = null;
  }

  onCancel() {
    this.editMode = false;
    if (this.profile) {
      this.profileForm.patchValue(this.profile);
      this.imagePreviewUrl = this.getAbsoluteImageUrl(
        this.profile.profilePicture
      );
    }
    this.selectedFileBase64 = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
        this.selectedFileBase64 = reader.result as string;
      };

      reader.readAsDataURL(file);
    } else {
      this.selectedFileBase64 = null;
      this.imagePreviewUrl = this.getAbsoluteImageUrl(
        this.profile?.profilePicture
      );
    }
  }

  getAbsoluteImageUrl(relativePath: string | null | undefined): string {
    if (!relativePath) {
      return 'https://via.placeholder.com/150';
    }
    if (
      relativePath.startsWith('http://') ||
      relativePath.startsWith('https://') ||
      relativePath.startsWith('data:image/')
    ) {
      return relativePath;
    }
    const cleanedRelativePath = relativePath.startsWith('/')
      ? relativePath
      : '/' + relativePath;
    return `${this.backendBaseUrl}${cleanedRelativePath}`;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedProfile: UserProfileResponse = this.profileForm.value;

      if (this.selectedFileBase64) {
        updatedProfile.profilePicture = this.selectedFileBase64;
      }

      this.profileService.updateProfile(updatedProfile).subscribe(
        (data) => {
          this.profile = data;
          this.editMode = false;
          console.log('Profil uspešno ažuriran:', this.profile);
          this.imagePreviewUrl = this.getAbsoluteImageUrl(
            this.profile.profilePicture
          );
          this.selectedFileBase64 = null;
        },
        (error) => {
          console.error('Greška pri ažuriranju profila:', error);
        }
      );
    } else {
      console.log('Forma nije validna.');
      this.profileForm.markAllAsTouched();
    }
  }
}
