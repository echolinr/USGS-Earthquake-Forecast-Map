import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
   name: 'minimumOne'
})
export class MinimumOnePipe implements PipeTransform {
  transform(value: number) {
    if (value < 1) {
        return 1;
    } else {
        return value;
    }
  }
}