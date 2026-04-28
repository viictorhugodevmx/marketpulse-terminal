import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskCenterComponent } from './risk-center.component';

describe('RiskCenterComponent', () => {
  let component: RiskCenterComponent;
  let fixture: ComponentFixture<RiskCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
