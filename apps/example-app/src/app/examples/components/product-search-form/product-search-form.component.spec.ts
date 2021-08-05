import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSearchFormComponent } from './product-search-form.component';

describe('ProductSearchFormComponent', () => {
  let component: ProductSearchFormComponent;
  let fixture: ComponentFixture<ProductSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
