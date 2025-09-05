import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../tour.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { Keypoint } from '../../shared/models/keypoint.model';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tour-map.html',
  styleUrl: './tour-map.css'
})
export class TourMap implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  public tourId: string | null = null;
  private roleSubscription!: Subscription;
  isGuide = false;
  keypoints: Keypoint[] = [];
  isLoading = true;

  private blueIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private tourService: TourService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('tourId');
    this.roleSubscription = this.authService.role$.subscribe(role => {
      this.isGuide = role === 'guide';
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    if (this.tourId) {
      this.loadTourKeypoints();
    }
  }

  initMap(): void {
    this.map = L.map('tour-map').setView([44.8176, 20.4569], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.roleSubscription.unsubscribe();
    this.map?.remove();
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
        this.isLoading = false;
      },
      (error) => {
        console.error('Failed to load keypoints:', error);
        this.isLoading = false;
      }
    );
  }

  drawKeypointsOnMap(): void {
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        this.map.removeLayer(layer);
      }
    });

    const coordinates: L.LatLngExpression[] = [];
    this.keypoints.forEach(kp => {
      const marker = L.marker([kp.latitude, kp.longitude], { icon: this.blueIcon }).addTo(this.map);
      marker.bindPopup(`<b>${kp.name}</b><br>${kp.description}`);
      coordinates.push([kp.latitude, kp.longitude]);
    });

    if (coordinates.length > 0) {
      const polyline = L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }
  }
}