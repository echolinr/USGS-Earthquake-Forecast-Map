import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  styleUrls: ['./addEvent.scss'],
  templateUrl: './addEvent.html'
})
export class AddEventPage {
  submitAttempt = false;
  eventForm: FormGroup;

  regionType: string = 'WC Circular 1994';
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
  centerType: string = 'Custom Location';
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
      name: 'Hypocenter',
      label: 'Hypocenter',
      id: 2
    }
  ];

  constructor(public formBuilder: FormBuilder) {
    this.eventForm = formBuilder.group({
      eventId: ['', Validators.compose([Validators.required])],
      emulate: ['', Validators.compose([Validators.required])],
      maxDays: ['', Validators.compose([Validators.required])],
      regionType: ['', Validators.compose([Validators.required])],
      centerType: ['', Validators.compose([Validators.required])],
    });
  }
}