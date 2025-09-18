import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedTours } from './purchased-tours';

describe('PurchasedTours', () => {
  let component: PurchasedTours;
  let fixture: ComponentFixture<PurchasedTours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedTours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasedTours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
