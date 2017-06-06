import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
   name: 'percentageForecast'
})
export class PercentageForecastPipe implements PipeTransform {
  transform(value: number) {
    let percentage = (value * 100);
    if (percentage < 1) {
        return '<1%';
    } else if (percentage > 99) {
        return '>99%';
    } else {
        return percentage.toFixed(2) + '%';
    }
  }
}