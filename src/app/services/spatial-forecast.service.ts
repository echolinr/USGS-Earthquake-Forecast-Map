import { Injectable, Output } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {SpatialData} from '../models/spatial-data';
import {ForecastOverviewData} from '../models/forecast-overview-data';

@Injectable()
export class SpatialForecastService {
  dataUrl: string = 'http://localhost:8080/api/forecasts/';

  constructor(private http: Http) { }

  loadSpatialForecastData(ID: string): Observable<SpatialData[]> {
    return this.http.get(this.dataUrl + `?id=${ID}`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

  loadAvailableForecastsData(): Observable<ForecastOverviewData[]> {
    return this.http.get(this.dataUrl + 'overview')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }
}