import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListPageContainerComponent } from './product-list-page-container.component';

describe('ProductListExampleContainerComponent', () => {
  let component: ProductListPageContainerComponent;
  let fixture: ComponentFixture<ProductListPageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductListPageContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListPageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
