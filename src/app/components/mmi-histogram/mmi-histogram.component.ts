import { Component, ElementRef, NgZone, OnDestroy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  ScaleBand,
  Selection,
  Transition
} from 'd3-ng2-service';

interface HistogramData {
  label: string;
  value: number;
}

@Component({
  selector: 'mmi-histogram',
  templateUrl: './mmi-histogram.component.html',
  styleUrls: ['./mmi-histogram.component.scss']
})

export class MMIHistogramComponent implements OnDestroy, OnChanges {
  @Input()
  data: HistogramData[];

  private rendered: boolean = false;

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if(this.rendered){
        this.d3Svg.selectAll('*').remove();
        this.loadHistogram();
      } else {       
        this.loadHistogram();
      }
    }
  }

  ngOnDestroy() {
    if (this.d3Svg.empty && !this.d3Svg.empty()) {
      this.d3Svg.selectAll('*').remove();
    }
  }

  loadHistogram() {
    let self = this;
    let d3 = self.d3;
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    let d3G: Selection<SVGGElement, any, null, undefined>;
    let width: number;
    let height: number;
    let x: ScaleBand<string>;
    let y: ScaleLinear<number, number>;
    let color: ScaleOrdinal<string, any>;

    if (self.parentNativeElement !== null) {

      d3ParentElement = d3.select(self.parentNativeElement);
      d3Svg = self.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

      let margin = { top: 20, right: 20, bottom: 40, left: 50 }
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;

      d3G = d3Svg.append<SVGGElement>('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");      

      if (!self.data){
        d3G.append('text')
        .text( "Please select a location")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "grey");
        return;
      }else{
        d3Svg.selectAll('text').remove();
      }

      x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
      y = d3.scaleLinear().rangeRound([height, 0]);
      color = d3.scaleOrdinal().range(["#c9ddfa", "#c9ddfa", "#c9ddfa", "#7ffafe", "#6cf99f", "#fef955", "#fdc444", "#fb8f33", "#fa1f1b", "#cd1111"]);

      x.domain(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);

      d3G.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
          .attr("transform", "translate(" + (width / 2) + " ," + (margin.bottom - 15) + ")")
          .style("text-anchor", "middle")    
          .attr("dy", "0.71em")      
          .style("fill", "#a4a4a4")
          .text("Shaking Intensity");

      d3G.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")        
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - (margin.left - 5))
          .attr("x", 0 - (height / 2))
          .attr("dy", "0.71em")
          .style("text-anchor", "middle")
          .style("fill", "#a4a4a4")
          .text("Probability of Shaking");

      let bar = d3G.selectAll(".bar")
        .data(self.data)
        .enter().append("rect")
        .style("fill", function (d, i) { return color(i.toString()); })
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.label); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .text(function (d) { return d.value + 'asd'; });

      bar.append("text")
        .attr("class", "value")
        .attr("x", x.bandwidth() / 2)
        .attr("dx", ".35em")
        .attr("text-anchor", "end")
        .text(function (d) {
          return (d.value + "%");
        })
        .attr("y", function (d) {
          return y(d.value);
        });

      self.rendered = true;
    }
  }
}