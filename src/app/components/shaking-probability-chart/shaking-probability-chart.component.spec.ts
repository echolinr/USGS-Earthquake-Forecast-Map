import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShakingProbabilityChartComponent } from './shaking-probability-chart.component';

describe('ShakingProbabilityChartComponent', () => {
  let component: ShakingProbabilityChartComponent;
  let fixture: ComponentFixture<ShakingProbabilityChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShakingProbabilityChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShakingProbabilityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
