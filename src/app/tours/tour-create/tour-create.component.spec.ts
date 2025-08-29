import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCreateComponent } from './tour-create.component';

describe('TourCreate', () => {
  let component: TourCreateComponent;
  let fixture: ComponentFixture<TourCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
