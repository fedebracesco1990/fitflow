import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView, CalendarEvent } from 'angular-calendar';
import { startOfMonth, endOfMonth, isSameDay } from 'date-fns';

@Component({
  selector: 'fit-flow-attendance-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './attendance-calendar.component.html',
  styleUrl: './attendance-calendar.component.scss',
})
export class AttendanceCalendarComponent implements OnChanges {
  @Input() attendanceDates: Date[] = [];
  @Input() viewDate: Date = new Date();

  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attendanceDates']) {
      this.updateEvents();
    }
  }

  private updateEvents(): void {
    this.events = this.attendanceDates.map((date) => ({
      start: new Date(date),
      title: 'Asistencia',
      color: {
        primary: '#22c55e',
        secondary: '#dcfce7',
      },
      allDay: true,
    }));
  }

  previousMonth(): void {
    const current = this.viewDate;
    this.viewDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  }

  nextMonth(): void {
    const current = this.viewDate;
    this.viewDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  today(): void {
    this.viewDate = new Date();
  }

  hasAttendance(date: Date): boolean {
    return this.attendanceDates.some((d) => isSameDay(new Date(d), date));
  }

  getMonthStart(): Date {
    return startOfMonth(this.viewDate);
  }

  getMonthEnd(): Date {
    return endOfMonth(this.viewDate);
  }
}
