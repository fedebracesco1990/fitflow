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
import { VolumeDataPoint } from '../../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'fit-flow-volume-chart',
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
export class VolumeChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() dataPoints: VolumeDataPoint[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataPoints'] && !changes['dataPoints'].firstChange && this.chart) {
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
      type: 'bar',
      data: {
        labels: this.dataPoints.map((p) => this.formatDate(p.date)),
        datasets: [
          {
            label: 'Volumen Total (kg)',
            data: this.dataPoints.map((p) => p.volume),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataPoint = this.dataPoints[context.dataIndex];
                const value = context.parsed.y ?? 0;
                return [
                  `Volumen: ${value.toLocaleString()} kg`,
                  `Entrenamientos: ${dataPoint?.workoutCount || 0}`,
                ];
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
            display: true,
            title: {
              display: true,
              text: 'Volumen (kg)',
            },
            beginAtZero: true,
            ticks: {
              callback: (value) => `${Number(value).toLocaleString()}`,
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.dataPoints.map((p) => this.formatDate(p.date));
    this.chart.data.datasets[0].data = this.dataPoints.map((p) => p.volume);
    this.chart.update();
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
