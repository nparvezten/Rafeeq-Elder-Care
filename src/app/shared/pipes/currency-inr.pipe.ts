import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyInr',
  standalone: true
})
export class CurrencyInrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0';
    }
    const rounded = Math.round(value);
    const formatted = rounded.toLocaleString('en-IN');
    return `₹${formatted}`;
  }
}
