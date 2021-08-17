import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShopTabComponent } from './product-shop-tab.component';

describe('ProductShopTabComponent', () => {
  let component: ProductShopTabComponent;
  let fixture: ComponentFixture<ProductShopTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductShopTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductShopTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
