import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListPaginatedPageContainerComponent } from './product-list-paginated-page-container.component';

describe('ProductListExampleContainerComponent', () => {
  let component: ProductListPaginatedPageContainerComponent;
  let fixture: ComponentFixture<ProductListPaginatedPageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductListPaginatedPageContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(
      ProductListPaginatedPageContainerComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
