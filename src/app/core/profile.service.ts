import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../profile/model/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private stakeholdersApi = 'http://localhost:8080/api';
  private profileApi = this.stakeholdersApi + '/user/profile';
  
  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.profileApi);
  }
}
