import { Injectable } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Temporal } from '@js-temporal/polyfill';

/**
 * DateAdapter that uses Temporal.PlainDate internally but represents dates
 * as YYYY-MM-DD strings. Displays dates to the user in DD/MM/YYYY format.
 */
@Injectable()
export class TemporalStringDateAdapter extends DateAdapter<string> {
  override getYear(date: string): number {
    return Temporal.PlainDate.from(date).year;
  }

  override getMonth(date: string): number {
    return Temporal.PlainDate.from(date).month - 1; // Material uses 0-based months
  }

  override getDate(date: string): number {
    return Temporal.PlainDate.from(date).day;
  }

  override getDayOfWeek(date: string): number {
    return Temporal.PlainDate.from(date).dayOfWeek % 7; // Temporal: 1=Mon..7=Sun → Material: 0=Sun..6=Sat
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { month: style });
    return Array.from({ length: 12 }, (_, i) => {
      const date = Temporal.PlainDate.from({ year: 2020, month: i + 1, day: 1 });
      return formatter.format(new Date(date.toString()));
    });
  }

  override getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  }

  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: style });
    // 2020-01-05 is a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = Temporal.PlainDate.from({ year: 2020, month: 1, day: 5 + i });
      return formatter.format(new Date(date.toString()));
    });
  }

  override getYearName(date: string): string {
    return String(this.getYear(date));
  }

  override getFirstDayOfWeek(): number {
    return 1; // Monday
  }

  override getNumDaysInMonth(date: string): number {
    return Temporal.PlainDate.from(date).daysInMonth;
  }

  override clone(date: string): string {
    return date;
  }

  override createDate(year: number, month: number, date: number): string {
    return Temporal.PlainDate.from({ year, month: month + 1, day: date }).toString();
  }

  override today(): string {
    return Temporal.Now.plainDateISO().toString();
  }

  override parse(value: unknown): string | null {
    if (typeof value === 'string' && value) {
      // Try YYYY-MM-DD first
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        try {
          return Temporal.PlainDate.from(value).toString();
        } catch {
          return null;
        }
      }
      // Try DD/MM/YYYY (user input format)
      const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        try {
          return Temporal.PlainDate.from({
            year: +match[3],
            month: +match[2],
            day: +match[1],
          }).toString();
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  override format(date: string): string {
    const d = Temporal.PlainDate.from(date);
    const day = String(d.day).padStart(2, '0');
    const month = String(d.month).padStart(2, '0');
    return `${day}/${month}/${d.year}`;
  }

  override addCalendarYears(date: string, years: number): string {
    return Temporal.PlainDate.from(date).add({ years }).toString();
  }

  override addCalendarMonths(date: string, months: number): string {
    return Temporal.PlainDate.from(date).add({ months }).toString();
  }

  override addCalendarDays(date: string, days: number): string {
    return Temporal.PlainDate.from(date).add({ days }).toString();
  }

  override toIso8601(date: string): string {
    return date;
  }

  override isDateInstance(obj: unknown): boolean {
    if (typeof obj !== 'string') return false;
    try {
      Temporal.PlainDate.from(obj);
      return true;
    } catch {
      return false;
    }
  }

  override isValid(date: string): boolean {
    try {
      Temporal.PlainDate.from(date);
      return true;
    } catch {
      return false;
    }
  }

  override invalid(): string {
    return 'Invalid Date';
  }
}

export const TEMPORAL_STRING_DATE_FORMATS = {
  parse: { dateInput: 'YYYY-MM-DD' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function provideTemporalStringDateAdapter() {
  return [
    { provide: DateAdapter, useClass: TemporalStringDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: TEMPORAL_STRING_DATE_FORMATS },
  ];
}
