import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';

import { ActiveMQService } from '../../services/activemq.services';


@Component({
  styleUrls: ['./addEvent.scss'],
  templateUrl: './addEvent.html'
})
export class AddEventPage {
  submitAttempt = false;
  eventForm: FormGroup;

  regionTypeOptions: any[] = [
    {
      name: 'WC Circular 1994',
      label: 'WC Circular 1994',
      id: 0
    },
    {
      name: 'Circular',
      label: 'Circular',
      id: 1
    },
    {
      name: 'Rectangular',
      label: 'Rectangular',
      id: 2
    }
  ];
  centerTypeOptions: any[] = [
    {
      name: 'Custom Location',
      label: 'Custom Location',
      id: 0
    },
    {
      name: 'Centroid',
      label: 'Centroid',
      id: 1
    },
    {
      name: 'Epicenter',
      label: 'Epicenter',
      id: 2
    }
  ];

  constructor(public formBuilder: FormBuilder, public activemqService: ActiveMQService, public snackBar: MdSnackBar) {
    this.initForm();
  }

  initForm(){
    this.eventForm = this.formBuilder.group({
      eventId: ['', Validators.compose([Validators.required])],
      emulate: [false, Validators.compose([Validators.required])],
      persistent: [true, Validators.compose([Validators.required])],
      dataMinDays: [0, Validators.compose([Validators.required])],
      dataMaxDays: [0, Validators.compose([Validators.required])],
      regionType: [{name: 'WC Circular 1994',label: 'WC Circular 1994',id: 0}, Validators.compose([Validators.required])],
      centerType: [{name: 'Centroid',label: 'Centroid',id: 1}, Validators.compose([Validators.required])],
      minDepth: [0, Validators.compose([Validators.required])],
      maxDepth: [700, Validators.compose([Validators.required])],
      radius: [20],
      centerLat: [0],
      centerLong: [0],
      centerDepth: [700],
      minLat: [0],
      maxLat: [0],
      minLong: [0],
      maxLong: [0],
      minA: [-4.5, Validators.compose([Validators.required])],
      maxA: [-0.5, Validators.compose([Validators.required])],
      minP: [0.98, Validators.compose([Validators.required])],
      maxP: [0.98, Validators.compose([Validators.required])],
      minC: [0.018, Validators.compose([Validators.required])],
      maxC: [0.018, Validators.compose([Validators.required])],
      g: [0.25, Validators.compose([Validators.required])],
      b: [1.0, Validators.compose([Validators.required])],
      h: [1.0, Validators.compose([Validators.required])],
      magCat: [4.5, Validators.compose([Validators.required])],
    });
  }

  submit(){
    if(this.eventForm.valid){
      let responseObject: any;
      responseObject = this.eventForm.value;
      responseObject.regionType = responseObject.regionType.name;
      responseObject.centerType = responseObject.centerType.name;
      responseObject.minLocation = { lat: responseObject.minLat, lon: responseObject.minLong, depth: responseObject.minDepth };
      responseObject.maxLocation = { lat: responseObject.maxLat, lon: responseObject.maxLong, depth: responseObject.maxDepth };
      responseObject.circleCenter = { lat: responseObject.centerLat, lon: responseObject.centerLong, depth: responseObject.centerDepth };

      delete responseObject.minDepth;
      delete responseObject.maxDepth;
      delete responseObject.centerLat;
      delete responseObject.centerLong;
      delete responseObject.centerDepth;
      delete responseObject.minLat;
      delete responseObject.maxLat;
      delete responseObject.minLong;
      delete responseObject.maxLong;

      if(responseObject.emulate){
        responseObject.dataMaxDays = 0.167; //4 hours in days
      }

      this.activemqService.addEvent(responseObject).subscribe(response => {
        if(response){
          console.log(response);
          this.snackBar.open('Event Added Sucessfully');
        }else{
          console.log('Empty Result');
        }
      }, error => {
        console.log(error);
      });
    }else{
      console.log('Invalid Data');
    }
  }
}