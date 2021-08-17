import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShopPageContainerComponent } from './product-shop-page-container.component';

describe('ProductListExampleContainerComponent', () => {
  let component: ProductShopPageContainerComponent;
  let fixture: ComponentFixture<ProductShopPageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductShopPageContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductShopPageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
