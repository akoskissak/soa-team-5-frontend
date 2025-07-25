import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCreateComponent } from './blog-create.component';

describe('BlogCreate', () => {
  let component: BlogCreateComponent;
  let fixture: ComponentFixture<BlogCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
