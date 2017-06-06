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
  selector: 'shaking-probability-chart',
  templateUrl: './shaking-probability-chart.component.html',
  styleUrls: ['shaking-probability-chart.component.scss']
})

export class ShakingProbabilityChartComponent implements OnDestroy, OnChanges {
  @Input()
  data: HistogramData[];

  @Input()
  domain: any[];

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
        this.loadChart();
      } else {       
        this.loadChart();
      }
    }
  }

  ngOnDestroy() {
    if (this.d3Svg.empty && !this.d3Svg.empty()) {
      this.d3Svg.selectAll('*').remove();
    }
  }

  loadChart() {
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

      x = d3.scaleBand().rangeRound([0, width]).padding(1);
      y = d3.scaleLinear().rangeRound([height, 0]);
      color = d3.scaleOrdinal().range(["#c9ddfa", "#c9ddfa", "#c9ddfa", "#7ffafe", "#6cf99f", "#fef955", "#fdc444", "#fb8f33", "#fa1f1b", "#cd1111"]);

      //x.domain(["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0", "1.1", "1.2", "1.3", "1.4", "1.5"]);
      x.domain(self.domain);

      let line = d3.line<HistogramData>()
        .x(function(d) { return x(d.label); })
        .y(function(d) { return y(d.value); });

      d3G.append("g")
        .attr("class", "axis axis--x")
        .call(d3.axisLeft(y).ticks(10, "%"))        
        .append("text")
          .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
          .style("text-anchor", "middle")    
          .attr("dy", "0.71em")      
          .style("fill", "#a4a4a4")
          .text("Shaking Intensity");

      d3G.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))        
        .append("text")        
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - (margin.left - 5))
          .attr("x", 0 + (height / 2))
          .attr("dy", "0.71em")
          .style("text-anchor", "middle")
          .style("fill", "#a4a4a4")
          .text("Probability of Shaking");

      d3G.append('path')
        .styles({"fill":"none", "stroke": "steelblue", "stroke-width": "2"})
        .attr("class", "line")
        .attr("d", line(self.data));

      let bar = d3G.selectAll(".dot")
        .data(self.data)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function (d) { return x(d.label);})
            .attr("cy", function (d) { return y(d.value);})
        
      self.rendered = true;
    }
  }
}