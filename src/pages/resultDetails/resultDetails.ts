import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ResultService } from '../../services/result.services';

@Component({ 
  styleUrls: ['./resultDetails.scss'],
  templateUrl: './resultDetails.html'
})
export class ResultDetailsPage {
  forecasts: any[];

  constructor(public resultService: ResultService, public route: ActivatedRoute) {
      let id = this.route.snapshot.params['id'];
    this.resultService.getLastForecast(id).subscribe(forecasts => {
      if(forecasts){
        this.forecasts = forecasts[0].forecast;
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });
  }
}