import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBasketTabComponent } from './product-basket-tab.component';

describe('ProductBasketTabComponent', () => {
  let component: ProductBasketTabComponent;
  let fixture: ComponentFixture<ProductBasketTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductBasketTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductBasketTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
