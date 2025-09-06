import { AfterViewInit, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { Keypoint } from '../../shared/models/keypoint.model';
import { TourService } from '../tour.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-keypoint-create',
  imports: [FormsModule],
  templateUrl: './keypoint-create.component.html',
  styleUrl: './keypoint-create.component.css'
})
export class KeypointCreateComponent implements OnInit, AfterViewInit {

  @Input() removeRequests!: Subject<Keypoint>;
  @Input() keypoints: Keypoint[] = [];
  @Output() keypointAdded = new EventEmitter<Keypoint>(); // NOVO

  kpName = '';
  kpDescription = '';
  kpImage: File | null = null;
  private map!: L.Map;
  private selectedLatLng: L.LatLng | null = null;
  private currentMarker: L.Marker | null = null;

  private markers: Map<string, L.Marker> = new Map();

  // Novi properties za edit mode
  isEditMode = false;
  keypointId: string | null = null;
  tourId: string | null = null;
  currentKeypoint: Keypoint | null = null;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService
  ) { }

  ngOnInit(): void {
    // Provjeri da li smo u edit mode
    this.tourId = this.route.snapshot.paramMap.get('tourId');
    this.keypointId = this.route.snapshot.paramMap.get('keypointId');
    
    if (this.keypointId) {
      this.isEditMode = true;
      
      // Pokušaj da dobiješ podatke iz router state
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state?.['keypoint']) {
        this.loadKeypointFromState(navigation.extras.state['keypoint']);
      } else {
        // Fallback na API poziv
        this.loadKeypointForEdit();
      }
    }
  }

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

        this.currentMarker = L.marker(this.selectedLatLng, this.redIcon).addTo(this.map);
        console.log(`Selected: ${this.selectedLatLng.lat}, ${this.selectedLatLng.lng}`);
      }
    });

    if (this.removeRequests) {
      this.removeRequests.subscribe(kp => {
        this.removeKeypointMarker(kp);
      });
    }

    // NOVO: Dodaj postojeće keypoints na mapu
    setTimeout(() => {
      this.displayExistingKeypoints();
    }, 100);
  }

  // NOVO: Prikaži postojeće keypoints na mapi
  displayExistingKeypoints(): void {
    this.keypoints.forEach(kp => {
      this.addKeypointMarker(kp);
    });
  }

  loadKeypointFromState(keypoint: Keypoint): void {
    this.currentKeypoint = keypoint;
    this.kpName = keypoint.name;
    this.kpDescription = keypoint.description;
    
    // Postavi marker na trenutnu poziciju
    this.selectedLatLng = L.latLng(keypoint.latitude, keypoint.longitude);
    
    // Čekaj da se mapa inicijalizuje prije dodavanja markera
    setTimeout(() => {
      if (this.selectedLatLng) {
        this.currentMarker = L.marker(this.selectedLatLng, this.redIcon).addTo(this.map);
        this.map.setView(this.selectedLatLng, 15);
      }
    }, 100);
  }

  loadKeypointForEdit(): void {
    if (this.keypointId && this.tourId) {
      // Koristi postojeći endpoint za dobijanje svih keypoints turu
      this.tourService.getKeyPointsByTourId(this.tourId).subscribe(
        (keypoints: any[]) => {
          const keypoint = keypoints.find(kp => kp.id === this.keypointId);
          
          if (keypoint) {
            this.currentKeypoint = {
              id: keypoint.id,
              name: keypoint.name,
              description: keypoint.description,
              latitude: keypoint.latitude,
              longitude: keypoint.longitude,
              imagePath: keypoint.imagePath,
              tourId: keypoint.tourId
            };
            
            this.kpName = this.currentKeypoint.name;
            this.kpDescription = this.currentKeypoint.description;
            
            // Postavi marker na trenutnu poziciju
            this.selectedLatLng = L.latLng(this.currentKeypoint.latitude, this.currentKeypoint.longitude);
            
            // Čekaj da se mapa inicijalizuje prije dodavanja markera
            setTimeout(() => {
              if (this.selectedLatLng) {
                this.currentMarker = L.marker(this.selectedLatLng, this.redIcon).addTo(this.map);
                this.map.setView(this.selectedLatLng, 15);
              }
            }, 100);
          } else {
            console.error('Keypoint not found in tour');
            alert('Keypoint not found');
          }
        },
        (error) => {
          console.error('Failed to load keypoints:', error);
          alert('Failed to load keypoint for editing');
        }
      );
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

    if (!this.kpName || !this.kpDescription) {
      alert("Keypoint name and description are required");
      return;
    }

    if (this.isEditMode) {
      this.updateKeypoint();
    } else {
      // IZMENJENO: Provjeri da li je tourId postavljen
      if (this.tourId) {
        // Postojeći tour - stvarno kreiraj keypoint preko API-ja
        this.createNewKeypoint(fileInput);
      } else {
        // Kreiranje nove ture - dodaj u privremeni array
        this.addToTourCreation(fileInput);
      }
    }
  }

  // NOVO: Dodaj keypoint tokom kreiranja ture
  private addToTourCreation(fileInput: HTMLInputElement): void {
    if (!this.kpImage) {
      alert("Image is required");
      return;
    }

    // Kreiraj privremeni keypoint objekat
    const newKeypoint: Keypoint = {
      name: this.kpName,
      description: this.kpDescription,
      latitude: this.selectedLatLng!.lat,
      longitude: this.selectedLatLng!.lng,
      image: this.kpImage // Privremeno čuvaj file objekat
    };

    // Dodaj u keypoints array
    this.keypoints.push(newKeypoint);
    
    // Emituj event za parent komponentu
    this.keypointAdded.emit(newKeypoint);

    // Dodaj marker na mapu
    this.addKeypointMarker(newKeypoint);

    // Resetuj formu
    this.resetForm(fileInput);
    
    console.log('Keypoint added to tour creation:', newKeypoint);
  }

  private createNewKeypoint(fileInput: HTMLInputElement): void {
    if (!this.kpImage) {
      alert("Image is required for new keypoint");
      return;
    }

    const formData = new FormData();
    formData.append('name', this.kpName);
    formData.append('description', this.kpDescription);
    formData.append('latitude', this.selectedLatLng!.lat.toString());
    formData.append('longitude', this.selectedLatLng!.lng.toString());
    formData.append('image', this.kpImage);
    formData.append('tourId', this.tourId!);

    this.tourService.createKeypoint(formData).subscribe(
      (newKeypoint: Keypoint) => {
        alert('Keypoint created successfully!');
        this.router.navigate(['/tours', this.tourId, 'map']);
      },
      (error) => {
        console.error('Failed to create keypoint:', error);
        alert('Failed to create keypoint');
      }
    );
  }

  private updateKeypoint(): void {
    if (this.kpImage) {
      // Update sa novom slikom - koristi FormData
      const formData = new FormData();
      formData.append('name', this.kpName);
      formData.append('description', this.kpDescription);
      formData.append('latitude', this.selectedLatLng!.lat.toString());
      formData.append('longitude', this.selectedLatLng!.lng.toString());
      formData.append('image', this.kpImage);

      this.tourService.updateKeypointWithFormData(this.keypointId!, formData).subscribe(
        (updatedKeypoint: Keypoint) => {
          alert('Keypoint updated successfully!');
          this.router.navigate(['/tours', this.tourId, 'map']);
        },
        (error) => {
          console.error('Failed to update keypoint:', error);
          alert('Failed to update keypoint');
        }
      );
    } else {
      // Update bez nove slike - koristi JSON
      const updateData: Partial<Keypoint> = {
        name: this.kpName,
        description: this.kpDescription,
        latitude: this.selectedLatLng!.lat,
        longitude: this.selectedLatLng!.lng
      };

      this.tourService.updateKeypoint(this.keypointId!, updateData).subscribe(
        (updatedKeypoint: Keypoint) => {
          alert('Keypoint updated successfully!');
          this.router.navigate(['/tours', this.tourId, 'map']);
        },
        (error) => {
          console.error('Failed to update keypoint:', error);
          alert('Failed to update keypoint');
        }
      );
    }
  }

  cancel(): void {
    if (this.tourId) {
      // Postojeći tour - vrati se na mapu
      this.router.navigate(['/tours', this.tourId, 'map']);
    }
    // Za kreiranje ture, ostaj na istoj stranici (ne radi ništa)
  }

  // NOVO: Resetuj formu nakon dodavanja keypoint-a
  private resetForm(fileInput: HTMLInputElement): void {
    this.kpName = '';
    this.kpDescription = '';
    this.kpImage = null;
    this.selectedLatLng = null;
    
    // Ukloni red marker
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }
    
    // Resetuj file input
    fileInput.value = '';
  }

  // NOVO: Dodaj marker za keypoint
  private addKeypointMarker(kp: Keypoint): void {
    const key = this.getKey(kp);
    const marker = L.marker([kp.latitude, kp.longitude], this.blueIcon).addTo(this.map);
    this.markers.set(key, marker);
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