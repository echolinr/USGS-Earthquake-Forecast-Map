import {EventEmitter, Injectable, Output} from "@angular/core";
import {Http, Response } from "@angular/http";

import { PointForcast } from "../core/pointForcast.class"

@Injectable()
export class SpatialForcastService {

  dataUrl: string = './assets/example.csv';  // now we use sample file stored in local directory. May change to real
                                                  // data source in the future

  completeSpatialForcastData: any[] = [];
  heatData: any[] = [];
  rowCount: number = 0;
  colCount: number = 0;
  @Output() readSpatialForcastDataDone: EventEmitter<any> = new EventEmitter();

  constructor(private http: Http) {
    //this.readSpatialForcastData();
  }

  readSpatialForcastData () {
    this.http.get(this.dataUrl)
      .subscribe(
        data => { this.extractSpatialForcastData(data),
          console.log("read data "+ this.rowCount + "x" + this.colCount ),
          this.readSpatialForcastDataDone.emit(null)
        },
        err => this.handleParseError(err)
      );

  }

  getHeatData(day: number, probability: number):any[] {
    let found : boolean = false;
    let scale: number  = 0.1;
    let heatArray = [];
    console.log("begin to process data");
    for (let i = 0; i < this.rowCount ; i++) {
      // find right time
      if ( (day > this.completeSpatialForcastData[i][0])  && (day <= this.completeSpatialForcastData[i][1])) {
        // find out the probability
        found = false;
        for (let j = 1; j <= 15; j++) {
          // now we chose largest scale for now
          if (this.completeSpatialForcastData[i][5+j] >= probability) {
            found = true;
            scale = j;
          }
        }
        if (found) {
          let oneHeatEntry = [];
          oneHeatEntry.push(this.completeSpatialForcastData[i][2]);
          oneHeatEntry.push(this.completeSpatialForcastData[i][3]);
          oneHeatEntry.push(scale*0.2/3.0);
          heatArray.push(oneHeatEntry);
          console.log(oneHeatEntry);
        }
      }
    }
    this.heatData = heatArray;
    return this.heatData;
  }

  private extractSpatialForcastData(res: Response) {

    let csvData = res['_body'] || '';
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    this.rowCount = allTextLines.length;
    this.colCount = headers.length;

    for ( let i = 0; i < allTextLines.length; i++) {
      // split content based on comma
      let data = allTextLines[i].split(',');
      if (data.length == headers.length) {
        let tarr = [];
        for ( let j = 0; j < headers.length; j++) {
          tarr.push(Number.parseFloat(data[j]));
        }
        lines.push(tarr);
      } else {
        this.rowCount--;
      }
    }
    this.completeSpatialForcastData = lines;
  }

  private handleParseError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return errMsg;
  }

}
