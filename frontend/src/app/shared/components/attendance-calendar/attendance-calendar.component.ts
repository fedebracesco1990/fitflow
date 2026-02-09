import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAttendance: boolean;
}

@Component({
  selector: 'fit-flow-attendance-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-calendar.component.html',
  styleUrl: './attendance-calendar.component.scss',
})
export class AttendanceCalendarComponent implements OnChanges {
  @Input() attendanceDates: Date[] = [];
  @Input() viewDate: Date = new Date();

  weeks: CalendarDay[][] = [];
  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attendanceDates'] || changes['viewDate']) {
      this.buildCalendar();
    }
  }

  previousMonth(): void {
    const current = this.viewDate;
    this.viewDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    const current = this.viewDate;
    this.viewDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.buildCalendar();
  }

  getMonthLabel(): string {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
  }

  private buildCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(this.createDay(date, false, today));
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push(this.createDay(date, true, today));
    }

    // Next month padding to complete last week
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        days.push(this.createDay(date, false, today));
      }
    }

    // Split into weeks
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private createDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
      hasAttendance: this.hasAttendance(date),
    };
  }

  private hasAttendance(date: Date): boolean {
    return this.attendanceDates.some(
      (d) =>
        new Date(d).getDate() === date.getDate() &&
        new Date(d).getMonth() === date.getMonth() &&
        new Date(d).getFullYear() === date.getFullYear()
    );
  }
}
