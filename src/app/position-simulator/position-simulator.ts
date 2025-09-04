import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { CommonModule } from '@angular/common';

import * as L from 'leaflet';
import { UserService } from '../core/user.service';

@Component({
 selector: 'app-position-simulator',
 standalone: true, 
 imports: [CommonModule, HttpClientModule], 
 templateUrl: './position-simulator.html',
 styleUrl: './position-simulator.css'
})
export class PositionSimulator implements AfterViewInit {

 private map!: L.Map;
 private currentMarker: L.Marker | null = null;
 public currentLocation: string = 'Nije definisana';
 public currentAddress: string = 'Učitavanje adrese...'; 

 constructor(
    private userService: UserService,
    private http: HttpClient 
  ) {}

 ngAfterViewInit(): void {
 this.initMap();
 this.loadInitialPosition();
 }

  private initMap(): void {
  this.map = L.map('map').setView([44.7866, 20.4489], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(this.map);

  this.map.on('click', (e: L.LeafletMouseEvent) => {
  this.onMapClick(e.latlng);
  });
  }
      private loadInitialPosition(): void {
      this.userService.getPosition().subscribe({
      next: (pos: { lat: number; lng: number; }) => {
      if (pos && pos.lat && pos.lng) {
      this.updateLocation(pos.lat, pos.lng);
      }
      },
      error: (err: any) => console.error('Greška pri učitavanju pozicije:', err)
      });
  }

    onMapClick(latlng: L.LatLng): void {
    this.updateLocation(latlng.lat, latlng.lng);

    this.userService.setPosition(latlng.lat, latlng.lng).subscribe({
    next: () => console.log('Pozicija uspešno sačuvana na backendu'),
    error: (err: any) => console.error('Greška pri čuvanju pozicije:', err)
    });
  }

    private updateLocation(lat: number, lng: number): void {
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      const latlng = L.latLng(lat, lng);
      this.currentMarker = L.marker(latlng).addTo(this.map)
        .bindPopup(`Your position:<br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();

      this.map.setView(latlng, 15);
      this.currentLocation = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

      this.reverseGeocode(lat, lng);
    }

  private reverseGeocode(lat: number, lng: number): void {
    this.currentAddress = 'Loading address...';
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data && data.display_name) {
          this.currentAddress = data.display_name;
        } else {
          this.currentAddress = 'Address not found.';
        }
      },
      error: (err) => {
        this.currentAddress = 'Greška pri učitavanju adrese.';
        console.error('Greška pri geokodiranju:', err);
      }
    });
  }
}
