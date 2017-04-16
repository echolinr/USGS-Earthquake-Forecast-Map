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
  templateUrl: './mmi-histogram.html',
  styleUrls: ['./mmi-histogram.scss']
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
    if (!this.data) return;

    let self = this;
    let d3 = this.d3;
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    let d3G: Selection<SVGGElement, any, null, undefined>;
    let width: number;
    let height: number;
    let sqrt3: number;
    let x: ScaleBand<string>;
    let y: ScaleLinear<number, number>;
    let color: ScaleOrdinal<string, any>;
    let brush: BrushBehavior<any>;
    let idleTimeout: number | null;
    let idleDelay: number;

    if (this.parentNativeElement !== null) {

      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

      let margin = { top: 20, right: 20, bottom: 30, left: 40 }
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;

      d3G = d3Svg.append<SVGGElement>('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
      y = d3.scaleLinear().rangeRound([height, 0]);
      color = d3.scaleOrdinal().range(["#c9ddfa", "#c9ddfa", "#c9ddfa", "#7ffafe", "#6cf99f", "#fef955", "#fdc444", "#fb8f33", "#fa1f1b", "#cd1111"]);

      x.domain(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);

      d3G.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      d3G.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .style("fill", "#fdc444")
        .text("Frequency");

      let bar = d3G.selectAll(".bar")
        .data(this.data)
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

      this.rendered = true;
    }
  }
}
