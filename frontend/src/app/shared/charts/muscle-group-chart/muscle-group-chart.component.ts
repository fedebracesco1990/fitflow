import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MuscleGroupVolume } from '../../../core/models';

Chart.register(...registerables);

const MUSCLE_GROUP_COLORS = [
  'rgba(99, 102, 241, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(34, 197, 94, 0.8)',
];

const MUSCLE_GROUP_BORDERS = [
  'rgba(99, 102, 241, 1)',
  'rgba(16, 185, 129, 1)',
  'rgba(245, 158, 11, 1)',
  'rgba(239, 68, 68, 1)',
  'rgba(139, 92, 246, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(14, 165, 233, 1)',
  'rgba(34, 197, 94, 1)',
];

@Component({
  selector: 'fit-flow-muscle-group-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [
    `
      .chart-container {
        position: relative;
        height: 300px;
        width: 100%;
      }
    `,
  ],
})
export class MuscleGroupChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: MuscleGroupVolume[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.data.map((d) => d.muscleGroupName),
        datasets: [
          {
            data: this.data.map((d) => d.volume),
            backgroundColor: MUSCLE_GROUP_COLORS.slice(0, this.data.length),
            borderColor: MUSCLE_GROUP_BORDERS.slice(0, this.data.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataItem = this.data[context.dataIndex];
                return [
                  `${dataItem.muscleGroupName}: ${dataItem.volume.toLocaleString()} kg`,
                  `${dataItem.percentage}% del total`,
                ];
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map((d) => d.muscleGroupName);
    this.chart.data.datasets[0].data = this.data.map((d) => d.volume);
    this.chart.data.datasets[0].backgroundColor = MUSCLE_GROUP_COLORS.slice(0, this.data.length);
    this.chart.data.datasets[0].borderColor = MUSCLE_GROUP_BORDERS.slice(0, this.data.length);
    this.chart.update();
  }
}
