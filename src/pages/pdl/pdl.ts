import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  styleUrls: ['./pdl.scss'],
  templateUrl: './pdl.html'
})
export class PdlRegionPage {
  submitAttempt = false;
  eventForm: FormGroup;


  constructor(public formBuilder: FormBuilder) {
    this.eventForm = formBuilder.group({
      minMag: [1.0, Validators.compose([Validators.required])],
      minLat: [33.0, Validators.compose([Validators.required])],
      minLon: [-124.0, Validators.compose([Validators.required])],
      maxLat: [42.0, Validators.compose([Validators.required])],
      maxLon: [-120.0, Validators.compose([Validators.required])],
    });
  }

  submit(){
    if(this.eventForm.valid){
      let responseObject: any;
      responseObject = this.eventForm.value;
      console.log(responseObject);
    }else{
      console.log('Invalid Data');
    }
  }
}
