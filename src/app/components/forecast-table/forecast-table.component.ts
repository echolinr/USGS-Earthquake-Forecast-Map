import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {ForecastRow} from 'app/models/forecast-row';

@Component({
  selector: 'forecast-table',
  templateUrl: './forecast-table.component.html',
  styleUrls: ['./forecast-table.component.scss']
})
export class ForecastTableComponent implements OnChanges {

  @Input()
  data: any;

  tableData: any;
  ranges: any[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
        this.loadTable();
    }
  }

  loadTable(){
    if(!this.data) return;

    let self = this;
    self.ranges = [];

    let weeklyRanges: any[] = [];
    let monthlyRanges: any[] = [];
    let yearlyRanges: any[] = [];
    
    let magnitudes: number[] = this.data.week.map((item: ForecastRow) => item.minMag);

    magnitudes.forEach(function(magnitude, index, array){
      if(index >= magnitudes.length - 1) return;

      self.ranges.push(magnitude + " - " + (array[index + 1]));

      weeklyRanges.push({ 
          range: magnitude + " - " + (array[index + 1]),
          probability: 1 - Math.exp(-1*(self.data.week.find((value) => value.minMag == magnitude).rate + self.data.week.find((value) => value.minMag == array[index + 1]).rate)),
          lowerBound: Math.round(self.data.week.find((value) => value.minMag == magnitude).lowerBound + self.data.week.find((value) => value.minMag == array[index + 1]).lowerBound),
          upperBound: Math.round(self.data.week.find((value) => value.minMag == magnitude).upperBound + self.data.week.find((value) => value.minMag == array[index + 1]).upperBound)
      });

      monthlyRanges.push({ 
          range: magnitude + " - " + (array[index + 1]),
          probability: 1 - Math.exp(-1*(self.data.month.find((value) => value.minMag == magnitude).rate + self.data.month.find((value) => value.minMag == array[index + 1]).rate)),
          lowerBound: Math.round(self.data.month.find((value) => value.minMag == magnitude).lowerBound + self.data.month.find((value) => value.minMag == array[index + 1]).lowerBound),
          upperBound: Math.round(self.data.month.find((value) => value.minMag == magnitude).upperBound + self.data.month.find((value) => value.minMag == array[index + 1]).upperBound)
      });

      yearlyRanges.push({ 
          range: magnitude + " - " + (array[index + 1]),
          probability: 1 - Math.exp(-1*(self.data.year.find((value) => value.minMag == magnitude).rate + self.data.year.find((value) => value.minMag == array[index + 1]).rate)),
          lowerBound: Math.round(self.data.year.find((value) => value.minMag == magnitude).lowerBound + self.data.year.find((value) => value.minMag == array[index + 1]).lowerBound),
          upperBound: Math.round(self.data.year.find((value) => value.minMag == magnitude).upperBound + self.data.year.find((value) => value.minMag == array[index + 1]).upperBound)
      });
    });

    this.tableData = [
      {type: "Week", ranges: weeklyRanges},      
      {type: "Month", ranges: monthlyRanges},
      {type: "Year", ranges: yearlyRanges}
    ];
  }
}