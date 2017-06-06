import { TestBed, inject } from '@angular/core/testing';

import { SpatialForecastService } from './spatial-forecast.service';

describe('SpatialForecastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpatialForecastService]
    });
  });

  it('should be created', inject([SpatialForecastService], (service: SpatialForecastService) => {
    expect(service).toBeTruthy();
  }));
});
