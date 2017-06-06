import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MmiHistogramComponent } from './mmi-histogram.component';

describe('MmiHistogramComponent', () => {
  let component: MmiHistogramComponent;
  let fixture: ComponentFixture<MmiHistogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MmiHistogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MmiHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
