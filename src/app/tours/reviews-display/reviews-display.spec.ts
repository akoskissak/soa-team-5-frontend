import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsDisplay } from './reviews-display';

describe('ReviewsDisplay', () => {
  let component: ReviewsDisplay;
  let fixture: ComponentFixture<ReviewsDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
