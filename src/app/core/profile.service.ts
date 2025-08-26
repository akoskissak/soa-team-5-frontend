import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfileResponse } from '../profile/model/user-profile-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private stakeholdersApi = 'http://localhost:8080/api';
  private profileApi = this.stakeholdersApi + '/user/profile';

  constructor(private http: HttpClient) {}

  getProfile(username?: string): Observable<UserProfileResponse> {
    if (username) {
      return this.http.get<UserProfileResponse>(
        `${this.profileApi}/${username}`
      );
    }
    return this.http.get<UserProfileResponse>(this.profileApi);
  }

  updateProfile(
    profileData: UserProfileResponse
  ): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(this.profileApi, profileData);
  }
}
