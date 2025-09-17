import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import * as L from 'leaflet';
import { UserService } from '../core/user.service';
import { ActivatedRoute } from '@angular/router';
import { TourService } from '../tours/tour.service';
import { Keypoint } from '../shared/models/keypoint.model';

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
  public tourId?: string;
  keypoints: Keypoint[] = [];
  tourStarted: boolean = false;

  private blueIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private tourService: TourService
  ) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadInitialPosition();

    this.route.queryParams.subscribe(params => {
      if (params['tourId']) {
        this.tourId = params['tourId'];
        this.loadTourKeypoints();
      }
    });
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

    if (this.map.getZoom() < 12) {
      this.map.setView(latlng, 12);
    }
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

  loadTourKeypoints(): void {
    this.tourService.getKeyPointsByTourId(this.tourId!).subscribe(
      (data: any[]) => {
        this.keypoints = data.map(kp => ({
          id: kp.id,
          name: kp.name,
          description: kp.description,
          latitude: kp.latitude,
          longitude: kp.longitude,
          imagePath: kp.imagePath,
          tourId: kp.tourId
        }));
        this.drawKeypointsOnMap();
      },
      (error) => {
        console.error('Failed to load keypoints:', error);
      }
    );
  }

  drawKeypointsOnMap(): void {
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    this.keypoints.forEach(kp => {
      const marker = L.marker([kp.latitude, kp.longitude], { icon: this.blueIcon }).addTo(this.map);

      let imageUrl = kp.imagePath?.replace(/^uploads\//, '')?.replace(/\\/g, '/');
      const fullImageUrl = `http://localhost:8080/uploads/${imageUrl}`;

      const popupContent = `<div style="text-align: center; min-width: 200px;">
      <img src="${fullImageUrl}" alt="${kp.name}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" onerror="this.style.display='none'">
      <h4 style="margin: 5px 0;">${kp.name}</h4>
      <p style="margin: 5px 0; font-size: 12px;">${kp.description}</p>
    </div>`;

      marker.bindPopup(popupContent, { maxWidth: 250 });
    });
  }

  startTourExecution(): void {
    if (this.tourId) {
      this.tourService.startTourExecution(this.tourId).subscribe({
        next: (res) => {
          console.log(res);
          alert("Tour execution started");
          this.tourStarted = true;
        },
        error: (err) => {
          console.error(err);
        }
      })
    }
  }
}
