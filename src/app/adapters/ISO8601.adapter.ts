import { Injectable, Optional, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

@Injectable()
export class IsoDateAdapter extends DateAdapter<string> {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) protected locale: string) {
    super();
  }

  override parse(value: any): string | null {
    if (typeof value === 'string') {
      return this.normalizeToYmd(value);
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return this.toYmd(value);
    }
    return null;
  }

  override format(date: string, displayFormat: any): string {
    if (!date) {
      return '';
    }
    return this.normalizeToYmd(date) || '';
  }

  override toIso8601(date: string): string {
    return date;
  }

  fromIso8601(iso8601String: string): string | null {
    return this.normalizeToYmd(iso8601String);
  }

  override isValid(date: string): boolean {
    return this.parseAsLocalDate(date) !== null;
  }

  override createDate(year: number, month: number, date: number): string {
    return this.toYmd(new Date(year, month, date));
  }

  override getYear(date: string): number {
    const parsed = this.parseAsLocalDate(date);
    return parsed ? parsed.getFullYear() : NaN;
  }

  override getMonth(date: string): number {
    const parsed = this.parseAsLocalDate(date);
    return parsed ? parsed.getMonth() : NaN;
  }

  override getDate(date: string): number {
    const parsed = this.parseAsLocalDate(date);
    return parsed ? parsed.getDate() : NaN;
  }

  override getDayOfWeek(date: string): number {
    const parsed = this.parseAsLocalDate(date);
    return parsed ? parsed.getDay() : NaN;
  }

  override addCalendarYears(date: string, years: number): string {
    const d = this.parseAsLocalDate(date);
    if (!d) {
      return date;
    }
    d.setFullYear(d.getFullYear() + years);
    return this.toYmd(d);
  }

  override addCalendarMonths(date: string, months: number): string {
    const d = this.parseAsLocalDate(date);
    if (!d) {
      return date;
    }
    d.setMonth(d.getMonth() + months);
    return this.toYmd(d);
  }

  override addCalendarDays(date: string, days: number): string {
    const d = this.parseAsLocalDate(date);
    if (!d) {
      return date;
    }
    d.setDate(d.getDate() + days);
    return this.toYmd(d);
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
    const parsed = this.parseAsLocalDate(date);
    return parsed ? parsed.getFullYear().toString() : '';
  }

  getFirstDayOfWeek(): number {
    // Assuming the first day of the week is Sunday (0). Adjust as needed for locale.
    return 0;
  }

  getNumDaysInMonth(date: string): number {
    const d = this.parseAsLocalDate(date);
    if (!d) {
      return 0;
    }
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  clone(date: string): string {
    return this.normalizeToYmd(date) || date;
  }

  today(): string {
    return this.toYmd(new Date());
  }

  isDateInstance(obj: any): boolean {
    return typeof obj === 'string' && this.parseAsLocalDate(obj) !== null;
  }

  invalid(): string {
    return 'Invalid Date';
  }

  private parseAsLocalDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const text = String(value).trim();
    const ymdMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const year = Number(ymdMatch[1]);
      const month = Number(ymdMatch[2]) - 1;
      const day = Number(ymdMatch[3]);
      const parsed = new Date(year, month, day);
      if (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month &&
        parsed.getDate() === day
      ) {
        return parsed;
      }
      return null;
    }

    const parsed = new Date(text);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  private normalizeToYmd(value: string): string | null {
    const text = String(value).trim();
    const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return this.parseAsLocalDate(match[1]) ? match[1] : null;
    }
    const parsed = this.parseAsLocalDate(text);
    return parsed ? this.toYmd(parsed) : null;
  }

  private toYmd(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
