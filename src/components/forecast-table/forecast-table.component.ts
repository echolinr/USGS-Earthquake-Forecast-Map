import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'forecast-table',
  templateUrl: './forecast-table.html',
  styleUrls: ['./forecast-table.scss']
})
export class ForecastTableComponent implements OnChanges {

  @Input()
  data: any;
  
  week56: string = '0';
  week56P: number = 0;
  week67: string = '0';
  week67P: number = 0;
  week78: string = '0';
  week78P: number = 0;

  month56: string = '0';
  month56P: number = 0;
  month67: string = '0';
  month67P: number = 0;
  month78: string = '0';
  month78P: number = 0;

  year56: string = '0';
  year56P: number = 0;
  year67: string = '0';
  year67P: number = 0;
  year78: string = '0';
  year78P: number = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
        this.loadTable();
    }
  }

  loadTable(){
    if(!this.data) return;

    this.week56 = '0-' + Math.round(this.data.week[0] + this.data.week[1]);
    this.week56P = 1 - Math.exp(-1*(this.data.week[0] + this.data.week[1]));
    this.week67 = '0-' + Math.round(this.data.week[1] + this.data.week[2]);
    this.week67P = 1 - Math.exp(-1*(this.data.week[1] + this.data.week[2]));
    this.week78 = '0-' + Math.round(this.data.week[2] + this.data.week[3]);
    this.week78P = 1 - Math.exp(-1*(this.data.week[2] + this.data.week[3]));
    
    this.month56 = '0-' + Math.round(this.data.month[0] + this.data.month[1]);
    this.month56P = 1 - Math.exp(-1*(this.data.month[0] + this.data.month[1]));
    this.month67 = '0-' + Math.round(this.data.month[1] + this.data.month[2]);
    this.month67P = 1 - Math.exp(-1*(this.data.month[1] + this.data.month[2]));
    this.month78 = '0-' + Math.round(this.data.month[2] + this.data.month[3]);
    this.month78P = 1 - Math.exp(-1*(this.data.month[2] + this.data.month[3]));
    
    this.year56 = '0-' + Math.round(this.data.year[0] + this.data.year[1]);
    this.year56P = 1 - Math.exp(-1*(this.data.year[0] + this.data.year[1]));
    this.year67 = '0-' + Math.round(this.data.year[1] + this.data.year[2]);
    this.year67P = 1 - Math.exp(-1*(this.data.year[1] + this.data.year[2]));
    this.year78 = '0-' + Math.round(this.data.year[2] + this.data.year[3]);
    this.year78P = 1 - Math.exp(-1*(this.data.year[2] + this.data.year[3]));
  }
}
