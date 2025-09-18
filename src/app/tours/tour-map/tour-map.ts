import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../tour.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  isPurchased = true;

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
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('tourId');
    this.roleSubscription = this.authService.role$.subscribe(role => {
    this.isGuide = role === 'guide';
    const isPurchasedParam = this.route.snapshot.paramMap.get('isPurchased');
    this.isPurchased = isPurchasedParam === 'true';
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

         if (!this.isPurchased && this.keypoints.length > 0) {
        this.keypoints = [this.keypoints[0]]; 
      }

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
  
  let imageUrl = kp.imagePath;
  if (imageUrl?.startsWith('static\\')) {
    imageUrl = imageUrl.substring(7); 
  }
  if (imageUrl?.startsWith('/static\\')) {
    imageUrl = imageUrl.substring(8);  
  }
  imageUrl = imageUrl?.replace(/\\/g, '/');
  
  const cleanImageUrl = imageUrl?.replace(/^uploads\//, '');
  
  const gatewayUrl = `http://localhost:8080/uploads/${cleanImageUrl}`;
  
      const fullImageUrl = gatewayUrl;
      
      let popupContent = `<div style="text-align: center; min-width: 200px;">
        <img src="${fullImageUrl}" alt="${kp.name}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" onerror="this.style.display='none'">
        <h4 style="margin: 5px 0;">${kp.name}</h4>
        <p style="margin: 5px 0; font-size: 12px;">${kp.description}</p>`;
      
      if (this.isGuide) {
        popupContent += `<div class="popup-buttons" style="margin-top: 10px;">
          <button onclick="window.editKeypoint('${kp.id}')" class="btn-edit" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 5px;">Edit</button>
          <button onclick="window.deleteKeypoint('${kp.id}')" class="btn-delete" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">Delete</button>
        </div>`;
      }
      
      popupContent += '</div>';
      
      marker.bindPopup(popupContent, { maxWidth: 250 });
      coordinates.push([kp.latitude, kp.longitude]);
    });

    (window as any).editKeypoint = (keypointId: string) => {
      this.editKeypoint(keypointId);
    };

    (window as any).deleteKeypoint = (keypointId: string) => {
      this.deleteKeypoint(keypointId);
    };

    if (coordinates.length > 0) {
      const polyline = L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }
  }

  editKeypoint(keypointId: string): void {
    const keypoint = this.keypoints.find(kp => kp.id === keypointId);
    
    if (keypoint) {
      this.router.navigate(['/tours', this.tourId, 'keypoints', 'edit', keypointId], {
        state: { keypoint: keypoint }
      });
    } else {
      console.error('Keypoint not found');
      alert('Keypoint not found');
    }
  }

  deleteKeypoint(keypointId: string): void {
    if (confirm('Are you sure you want to delete this keypoint?')) {
      this.tourService.deleteKeypoint(keypointId).subscribe(
        () => {
          this.loadTourKeypoints();
        },
        (error) => {
          console.error('Failed to delete keypoint:', error);
          alert('Failed to delete keypoint');
        }
      );
    }
  }

  addNewKeypoint(): void {
    this.router.navigate(['/tours', this.tourId, 'keypoints', 'new']);
  }
}