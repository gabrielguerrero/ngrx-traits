import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPickerComponent } from './product-picker.component';

describe('ProductPickerComponent', () => {
  let component: ProductPickerComponent;
  let fixture: ComponentFixture<ProductPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
