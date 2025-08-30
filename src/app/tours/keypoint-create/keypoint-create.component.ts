import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Keypoint } from '../../shared/models/keypoint.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-keypoint-create',
  imports: [FormsModule],
  templateUrl: './keypoint-create.component.html',
  styleUrl: './keypoint-create.component.css'
})
export class KeypointCreateComponent implements AfterViewInit {

  @Input() removeRequests!: Subject<Keypoint>;
  @Input() keypoints: Keypoint[] = [];

  kpName = '';
  kpDescription = '';
  kpImage: File | null = null;
  private map!: L.Map;
  private selectedLatLng: L.LatLng | null = null;
  private currentMarker: L.Marker | null = null;

  private markers: Map<string, L.Marker> = new Map();

  blueIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [14, 41],
      iconUrl: 'images/marker-icon.png'
    }),
  };

  redIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [14, 41],
      iconUrl: 'images/marker-icon-red.png'
    }),
  };

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([44.8176, 20.4569], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.selectedLatLng = e.latlng;

      if (this.selectedLatLng) {
        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker);
        }

        this.currentMarker = L.marker(this.selectedLatLng, this.redIcon ).addTo(this.map);

        console.log(`Selected: ${this.selectedLatLng.lat}, ${this.selectedLatLng.lng}`);
      }
    });

    if (this.removeRequests) {
      this.removeRequests.subscribe(kp => {
        this.removeKeypointMarker(kp);
      });
    }
  }

  onImageSelected(event: any) {
    this.kpImage = event.target.files[0];
  }

  saveKeypoint(fileInput: HTMLInputElement) {
    if (!this.selectedLatLng) {
      alert("Click on the map to choose a location!");
      return;
    }

    if (!this.kpName || !this.kpDescription || !this.kpImage) {
      alert("Keypoint name, description and image are required");
      return;
    }

    const kp: Keypoint = {
      name: this.kpName,
      description: this.kpDescription,
      latitude: this.selectedLatLng.lat,
      longitude: this.selectedLatLng.lng,
      image: this.kpImage
    };

    this.keypoints.push(kp);

    if (this.currentMarker) {
      this.currentMarker.setIcon(this.blueIcon.icon);
    }

    const key = this.getKey(kp);
    this.markers.set(key, this.currentMarker!);

    this.kpName = '';
    this.kpDescription = '';
    this.kpImage = null;
    this.selectedLatLng = null;
    this.currentMarker = null;

    fileInput.value = '';
  }

  private getKey(kp: Keypoint) {
    return `${kp.latitude},${kp.longitude},${kp.name}`;
  }

  removeKeypointMarker(kp: Keypoint) {
    const key = this.getKey(kp);
    const marker = this.markers.get(key);
    if (marker) {
      this.map.removeLayer(marker);
      this.markers.delete(key);
    }
  }
}
