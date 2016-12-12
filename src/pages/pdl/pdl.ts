import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PDLService } from '../../services/pdl.services';

@Component({
  styleUrls: ['./pdl.scss'],
  templateUrl: './pdl.html'
})
export class PdlRegionPage {
  submitAttempt = false;
  eventForm: FormGroup;
  filters: any[];


  constructor(public formBuilder: FormBuilder, public pdlService: PDLService) {
    this.eventForm = formBuilder.group({
      name: ['northern_cal', Validators.compose([Validators.required])],
      minMag: [1.0, Validators.compose([Validators.required])],
      minLat: [33.0, Validators.compose([Validators.required])],
      minLon: [-124.0, Validators.compose([Validators.required])],
      maxLat: [42.0, Validators.compose([Validators.required])],
      maxLon: [-120.0, Validators.compose([Validators.required])],
    });

    this.pdlService.getPDLFilters().subscribe(filters => {
      if(filters){
        this.filters = filters;
      }else{
        console.log('No Data');
      }
    }, error => {      
        console.log(error);
    });
  }

  submit(){
    if(this.eventForm.valid){
      let responseObject: any;
      responseObject = this.eventForm.value;      

      /** name, minMag, minLat, minLon, minLat, maxLon, maxLat, minLon, maxLat, maxLon */
      let dataArray = [];
      dataArray.push(responseObject.name);
      dataArray.push(responseObject.minMag);
      dataArray.push(responseObject.minLat);
      dataArray.push(responseObject.minLon);
      dataArray.push(responseObject.minLat);
      dataArray.push(responseObject.maxLon);
      dataArray.push(responseObject.maxLat);
      dataArray.push(responseObject.minLon);
      dataArray.push(responseObject.maxLat);
      dataArray.push(responseObject.maxLon);

      console.log(dataArray);

      this.pdlService.addPDLFilter(dataArray).subscribe(response => {
        if(response){
          console.log('Ok Added');
          this.filters.push({name : responseObject.name, minMag : responseObject.minMag, minLat : responseObject.minLat, minLon : responseObject.minLon, maxLat : responseObject.maxLat, maxLon : responseObject.maxLon});
        }else{
          console.log('Ups');
        }
      }, error => {
        console.log(error);
      });
    }else{
      console.log('Invalid Data');
    }
  }

  delete(filterName: string){
    this.pdlService.deletePDLFilter(filterName).subscribe(response => {
      if(response){
        console.log('Ok Deleted');
        this.filters = this.filters.filter(filter => {
          return filter.name != filterName;
        });
      }else{
        console.log('Ups');
      }
    }, error => {
      console.log(error);
    });
  }
}
