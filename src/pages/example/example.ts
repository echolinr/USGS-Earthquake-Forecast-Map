import { Component, OnInit, ElementRef } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import {SpatialForcastService} from "../../services/spatialforcast.service"; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface

@Component({
  templateUrl: "./example.html",
})
export class TestD3Component   { 
  private MMIData: any[];
  private ForecastTableData: any;

  constructor(private spatialForcastService: SpatialForcastService) { // <-- pass the D3 Service into the constructor

      this.spatialForcastService.loadSpatialForecastData().subscribe(data => {
      if(data){
        this.ForecastTableData = this.getForecastTable(data, 0);
        console.log(this.ForecastTableData);
        this.MMIData = this.getMMIStats(this.getDataByTime(1, data));
        //this.MMIData = this.getMMIStats(data);
        console.log(this.MMIData);
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });

  }

  getDataByTime(days: Number, data: any[]) : any[] {
    return data.filter(function(row){ return row[1] <= days});
  }

  getMMIStats(data: any[]) : any[] {
    let MMIStats = [];
    let MMIStartColumn = 20;
    let MMIRoman = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];
    let MMI = [1,2,3,4,5,6,7,8,9,10];

    if(data.length == 1){
      MMIRoman.forEach(function(value, index){
        MMIStats.push({"label": value, "value": data[MMIStartColumn + index + 1]}); 
      });
      return MMIStats; 
    }

    for(let i of MMI){
      let P = data.reduce(function(previous, current){
        if(Array.isArray(previous)) return (1 - previous [MMIStartColumn + i]);
        return previous*(1 - current[MMIStartColumn + i]);
      });
      console.log(P);
      MMIStats.push({"label": MMIRoman[i-1], "value": (1 - P)}); 
    }

    return MMIStats;   
  }

  getForecastTable(data: any[], day: number): any{
    let m = [5, 6, 7, 8];

    data = data.filter(function(row){ return row[0] >= day});
    let events = data.map(function(item){ return [item[0],item[1]].concat(m.map(function(magnitude){ return Math.pow(10, item[4] - item[5]*magnitude); })); });

    let week = events.filter(function(row){ return row[1] <= (day + 7)}).reduce(function(previous, current){ 
      if(!Array.isArray(previous)){
        return current;
      }
      return previous.map(function(value, index){ return value+current[index]; });
    });
    week = week.slice(2);

    let month = events.filter(function(row){ return row[1] <= (day + 30)}).reduce(function(previous, current){ 
      if(!Array.isArray(previous)){
        return current;
      }
      return previous.map(function(value, index){ return value+current[index]; });
    });
    month = month.slice(2);

    let year = events.filter(function(row){ return row[1] <= (day + 360)}).reduce(function(previous, current){ 
      if(!Array.isArray(previous)){
        return current;
      }
      return previous.map(function(value, index){ return value+current[index]; });
    });
    year = year.slice(2);

    return {'week': week, 'month': month, 'year': year};
  }

}
