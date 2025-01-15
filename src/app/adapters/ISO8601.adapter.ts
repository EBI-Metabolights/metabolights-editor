import { Injectable, Optional, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

@Injectable()
export class IsoDateAdapter extends DateAdapter<string> {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) protected locale: string) {
    super();
  }

  override parse(value: any): string | null {
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return value;
    }
    return null;
  }

  override format(date: string, displayFormat: any): string {
    if (!date) {
      return '';
    }
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  }

  override toIso8601(date: string): string {
    return date;
  }

  fromIso8601(iso8601String: string): string | null {
    return iso8601String;
  }

  override isValid(date: string): boolean {
    return !isNaN(Date.parse(date));
  }

  override createDate(year: number, month: number, date: number): string {
    const isoString = new Date(year, month, date).toISOString();
    return isoString.split('T')[0]; // Return in YYYY-MM-DD format
  }

  override getYear(date: string): number {
    return new Date(date).getFullYear();
  }

  override getMonth(date: string): number {
    return new Date(date).getMonth();
  }

  override getDate(date: string): number {
    return new Date(date).getDate();
  }

  override getDayOfWeek(date: string): number {
    return new Date(date).getDay();
  }

  override addCalendarYears(date: string, years: number): string {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().split('T')[0];
  }

  override addCalendarMonths(date: string, months: number): string {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  }

  override addCalendarDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { month: style });
    return Array.from({ length: 12 }, (_, i) =>
      formatter.format(new Date(2023, i, 1))
    );
  }

  getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: style });
    const baseDate = new Date(2023, 0, 1); // Sunday
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000))
    );
  }

  getYearName(date: string): string {
    return new Date(date).getFullYear().toString();
  }

  getFirstDayOfWeek(): number {
    // Assuming the first day of the week is Sunday (0). Adjust as needed for locale.
    return 0;
  }

  getNumDaysInMonth(date: string): number {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  clone(date: string): string {
    return new Date(date).toISOString();
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  isDateInstance(obj: any): boolean {
    return typeof obj === 'string' && !isNaN(Date.parse(obj));
  }

  invalid(): string {
    return 'Invalid Date';
  }
}
