import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(public formBuilder: FormBuilder, public activemqService: ActiveMQService) {
    this.eventForm = formBuilder.group({
      eventId: ['', Validators.compose([Validators.required])],
      emulate: [false, Validators.compose([Validators.required])],
      persistent: [false, Validators.compose([Validators.required])],
      minDays: [0, Validators.compose([Validators.required])],
      maxDays: [0, Validators.compose([Validators.required])],
      regionType: ['WC Circular 1994', Validators.compose([Validators.required])],
      centerType: ['Epicenter', Validators.compose([Validators.required])],
      minDepth: [0, Validators.compose([Validators.required])],
      maxDepth: [1000, Validators.compose([Validators.required])],
      radius: [20],
      centerLat: [0],
      centerLong: [0],
      centerDepth: [1000],
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
    });
  }

  submit(){
    console.log(this.eventForm);
    if(this.eventForm.valid){
      let responseObject: any;
      responseObject = this.eventForm.value;
      responseObject.regionType = responseObject.regionType.name;
      responseObject.centerType = responseObject.centerType.name;
      responseObject.minLocation = { lat: responseObject.minLat, lon: responseObject.minLong, depth: responseObject.minDepth };
      responseObject.maxLocation = { lat: responseObject.maxLat, lon: responseObject.maxLong, depth: responseObject.maxDepth };
      responseObject.circleCenter = { lat: responseObject.centerLat, lon: responseObject.centerLong, depth: responseObject.centerDepth };

      this.activemqService.addEvent(responseObject).subscribe(response => {
        if(response){
          console.log(response);
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