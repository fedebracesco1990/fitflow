import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayOfWeek, DayOfWeekLabels, UserRoutine } from '../../../../core/models';

@Component({
  selector: 'fit-flow-day-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-navigator.component.html',
  styleUrl: './day-navigator.component.scss',
})
export class DayNavigatorComponent {
  @Input() selectedDay: DayOfWeek = DayOfWeek.MONDAY;
  @Input() weekData: Record<DayOfWeek, UserRoutine[]> | null = null;
  @Input() today: DayOfWeek = DayOfWeek.MONDAY;

  @Output() dayChange = new EventEmitter<DayOfWeek>();

  days = Object.values(DayOfWeek);
  dayLabels = DayOfWeekLabels;

  dayAbbreviations: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'Lun',
    [DayOfWeek.TUESDAY]: 'Mar',
    [DayOfWeek.WEDNESDAY]: 'Mié',
    [DayOfWeek.THURSDAY]: 'Jue',
    [DayOfWeek.FRIDAY]: 'Vie',
    [DayOfWeek.SATURDAY]: 'Sáb',
    [DayOfWeek.SUNDAY]: 'Dom',
  };

  selectDay(day: DayOfWeek): void {
    this.dayChange.emit(day);
  }

  hasRoutine(day: DayOfWeek): boolean {
    return !!this.weekData && this.weekData[day]?.length > 0;
  }

  isSelected(day: DayOfWeek): boolean {
    return this.selectedDay === day;
  }

  isToday(day: DayOfWeek): boolean {
    return this.today === day;
  }
}
