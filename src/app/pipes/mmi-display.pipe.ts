import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
   name: 'mmiDisplay'
})
export class MmiDisplayPipe implements PipeTransform {
  transform(value: number) {
    if (value === 0.1) {
      return 'I';
    }
    if (value === 0.2) {
      return 'II';
    }
    if (value === 0.3) {
      return 'III';
    }
    if (value === 0.4) {
      return 'IV';
    }
    if (value === 0.5) {
      return 'V';
    }
    if (value === 0.6) {
      return 'VI';
    }
    if (value === 0.7) {
      return 'VII';
    }
    if (value === 0.8) {
      return 'VIII';
    }
    if (value === 0.9) {
      return 'IX';
    }
    return 'X';

  }

}
