import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';
import type { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { CounterEntry, CounterService } from '../../services/counter.service';

@Component({
  selector: 'app-history',
  imports: [Button, Modal, NgxEchartsDirective],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private readonly _counterService = inject(CounterService);

  loading = signal(true);
  showHistory = signal(false);
  options!: EChartsCoreOption;

  ngOnInit(): void {
    this._counterService.getAll().subscribe((r) => {
      this.loading.set(false);
      this.initChart(r);
    });
  }

  private initChart(entries: CounterEntry[]) {
    const xAxisData = [];
    const dogData = [];
    const godData = [];
    const totalData= [];

    for (let i = 0; i < entries.length; i++) {
      xAxisData.push(new Date(entries[i].date).toLocaleDateString('it-IT'));
      dogData.push(entries[i].dog);
      godData.push(entries[i].god);
      totalData.push(entries[i].dog + entries[i].god);
    }

    this.options = {
      legend: {
        data: ['Dog', 'God'],
        align: 'left',
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Dog',
          type: 'bar',
          color: '#c00909',
          data: dogData,
        
          animationDelay: (idx: number) => idx * 10,
        },
        {
          name: 'God',
          type: 'bar',
          color: '#0090c0',
          data: godData,
          animationDelay: (idx: number) => idx * 10 + 100,
        },
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          color: '#000000',
          data: totalData,
          animationDelay: (idx: number) => idx * 10 + 200,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  }
}
