import { Component, OnInit } from '@angular/core';
import { Profile } from './model/profile.model';
import { ProfileService } from '../core/profile.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: Profile | undefined;
  profileForm!: FormGroup;
  editMode: boolean = false;
  selectedFileBase64: string | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  private backendBaseUrl = 'http://localhost:8080';

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadProfile();

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      profilePicture: [''],
      biography: [''],
      motto: ['']
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe(data => {
      this.profile = data;
      console.log('Učitan profil:', this.profile);
      this.profileForm.patchValue(this.profile);
      this.imagePreviewUrl = this.getAbsoluteImageUrl(this.profile.profilePicture);
    }, error => {
      console.error('Greška pri učitavanju profila:', error);
    });
  }

  onEdit() {
    this.editMode = true;
    if (this.profile) {
      this.profileForm.patchValue(this.profile);
      this.imagePreviewUrl = this.getAbsoluteImageUrl(this.profile.profilePicture);
    }
    this.selectedFileBase64 = null;
  }

  onCancel() {
    this.editMode = false;
    if (this.profile) {
      this.profileForm.patchValue(this.profile);
      this.imagePreviewUrl = this.getAbsoluteImageUrl(this.profile.profilePicture);
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
      this.imagePreviewUrl = this.getAbsoluteImageUrl(this.profile?.profilePicture);
    }
  }

  getAbsoluteImageUrl(relativePath: string | null | undefined): string {
    if (!relativePath) {
      return 'https://via.placeholder.com/150';
    }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:image/')) {
      return relativePath;
    }
    const cleanedRelativePath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    return `${this.backendBaseUrl}${cleanedRelativePath}`;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedProfile: Profile = this.profileForm.value;

      if (this.selectedFileBase64) {
        updatedProfile.profilePicture = this.selectedFileBase64;
      }

      this.profileService.updateProfile(updatedProfile).subscribe(
        data => {
          this.profile = data;
          this.editMode = false;
          console.log('Profil uspešno ažuriran:', this.profile);
          this.imagePreviewUrl = this.getAbsoluteImageUrl(this.profile.profilePicture);
          this.selectedFileBase64 = null;
        },
        error => {
          console.error('Greška pri ažuriranju profila:', error);
        }
      );
    } else {
      console.log('Forma nije validna.');
      this.profileForm.markAllAsTouched();
    }
  }
}