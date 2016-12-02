import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ResultService } from '../../services/result.services';

@Component({ 
  styleUrls: ['./eventResults.scss'],
  templateUrl: './eventResults.html'
})
export class EventResultsPage {
  results: any[];

  constructor(public resultService: ResultService, public route: ActivatedRoute) {
      let id = this.route.snapshot.params['id'];
    this.resultService.getLastResults(id).subscribe(results => {
      if(results){
        this.results = results;
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });
  }
}