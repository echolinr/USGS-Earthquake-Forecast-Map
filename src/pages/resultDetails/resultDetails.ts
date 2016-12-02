import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ResultService } from '../../services/result.services';

@Component({ 
  styleUrls: ['./resultDetails.scss'],
  templateUrl: './resultDetails.html'
})
export class ResultDetailsPage {
  forecasts: any[];
  eventId: any;
  model: any;
  time: any;

  constructor(public resultService: ResultService, public route: ActivatedRoute) {
    let resultId = this.route.snapshot.params['id'];
    this.resultService.getLastForecast(resultId).subscribe(forecasts => {
      if(forecasts){
        this.forecasts = forecasts[0].forecast;
        this.eventId = forecasts[0].eventId;
        this.model = forecasts[0].model;
        this.time = forecasts[0].time;
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });
  }
}