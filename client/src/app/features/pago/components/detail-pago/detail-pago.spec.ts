import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPago } from './detail-pago';

describe('DetailPago', () => {
  let component: DetailPago;
  let fixture: ComponentFixture<DetailPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailPago],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
