import { Injectable, Output } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SpatialForcastService {

  //according sample data, I just hardcore the forcast data's time slot, there maybe smart way to generate this dynamically
  datafileUrl: string = '../assets/example.csv';  // now we use sample file stored in local directory. May change to real data source in the future
  dataUrl: string = 'http://localhost:8080/api/forecasts/';

  constructor(private http: Http) { }

  loadSpatialForecastData(): Observable<any[]> {
    return this.http.get(this.dataUrl)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

  loadSpatialForcastDataByMapDate(lat: number, lng: number, zoom: number, startDay: number, endDay: number): Observable<any[]> {
    return this.http.get(this.dataUrl)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }
}

