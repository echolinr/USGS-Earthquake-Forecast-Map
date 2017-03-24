import { Component, OnInit, ElementRef } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface

@Component({
  selector: 'app-test-d3',
  template: '<svg width="960" height="600"></svg>'
})
export class TestD3Component implements OnInit {

  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

  constructor(element: ElementRef, d3Service: D3Service) { // <-- pass the D3 Service into the constructor
    this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    let d3 = this.d3; // <-- for convenience use a block scope variable
    let d3ParentElement: Selection<any, any, any, any>; // <-- Use the Selection interface (very basic here for illustration only)

    let self = this;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;

    if (this.parentNativeElement !== null) {

      d3ParentElement = d3.select(this.parentNativeElement); // <-- use the D3 select method 
      
      d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

      let width = +d3Svg.attr('width');
      let height = +d3Svg.attr('height');

      //let d3G = d3Svg.append<SVGGElement>('g');

      //let x = d3.scaleOrdinal().domain([]).range([]);

      d3Svg.selectAll<SVGRectElement, any>('bar')
      .data([1,1,1,2,3,4,5]);

      //let histogram = d3.histogram().

      // Do more D3 things 

    }
  }

}