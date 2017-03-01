import { Component, ViewChild } from '@angular/core';
import { MdInputDirective } from '@angular/material';

import { AftershockService } from '../../services/aftershock.services';

@Component({
  selector: 'home', 
  styleUrls: ['./home.scss'],
  templateUrl: './home.html'
})
export class HomePage {
  aftershocks: any[];
   @ViewChild('eventId') eventId: MdInputDirective;

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

  search(){
    if(this.eventId.value.trim() != ''){
      this.aftershockService.getLastAftershocksById(this.eventId.value.trim()).subscribe(aftershocks => {
        if(aftershocks){
          this.aftershocks = aftershocks;
        }else{
          console.log('No Data');
        }
      }, error => {      
          console.log(error);
      });
    } else {
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
}