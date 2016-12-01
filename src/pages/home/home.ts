import { Component } from '@angular/core';

import { AftershockService } from '../../services/aftershock.services';

@Component({
  selector: 'home', 
  styleUrls: ['./home.scss'],
  templateUrl: './home.html'
})
export class HomePage {
  aftershocks: any[];

  constructor(public aftershockService: AftershockService) {
    this.aftershockService.getLastAftershocks().subscribe(aftershocks => {
      if(aftershocks){
        this.aftershocks = aftershocks;
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });
  }
}