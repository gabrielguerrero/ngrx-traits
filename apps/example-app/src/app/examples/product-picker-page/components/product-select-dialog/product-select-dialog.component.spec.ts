import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectDialogComponent } from './product-select-dialog.component';

describe('ProductSelectDialogComponent', () => {
  let component: ProductSelectDialogComponent;
  let fixture: ComponentFixture<ProductSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
