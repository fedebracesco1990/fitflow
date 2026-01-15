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
import { ExerciseProgressPoint } from '../../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'fit-flow-exercise-progress-chart',
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
export class ExerciseProgressChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() dataPoints: ExerciseProgressPoint[] = [];
  @Input() exerciseName = '';
  @Input() showVolume = true;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataPoints'] || changes['showVolume']) &&
      !changes['dataPoints']?.firstChange &&
      this.chart
    ) {
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

    const datasets = [
      {
        label: 'Peso Máximo (kg)',
        data: this.dataPoints.map((p) => p.maxWeight),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        yAxisID: 'y',
      },
    ];

    if (this.showVolume) {
      datasets.push({
        label: 'Volumen (kg×reps)',
        data: this.dataPoints.map((p) => p.maxVolume),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        yAxisID: 'y1',
      });
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.dataPoints.map((p) => this.formatDate(p.date)),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: !!this.exerciseName,
            text: this.exerciseName,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y ?? 0;
                if (label.includes('Volumen')) {
                  return `${label}: ${value.toLocaleString()} kg`;
                }
                return `${label}: ${value} kg`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha',
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Peso (kg)',
            },
            beginAtZero: false,
          },
          y1: {
            type: 'linear',
            display: this.showVolume,
            position: 'right',
            title: {
              display: true,
              text: 'Volumen',
            },
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: false,
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.dataPoints.map((p) => this.formatDate(p.date));
    this.chart.data.datasets[0].data = this.dataPoints.map((p) => p.maxWeight);

    if (this.showVolume && this.chart.data.datasets[1]) {
      this.chart.data.datasets[1].data = this.dataPoints.map((p) => p.maxVolume);
    }

    this.chart.update();
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
