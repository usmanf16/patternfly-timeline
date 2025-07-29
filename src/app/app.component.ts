import { Component, OnInit } from '@angular/core';
import { TimelineData, TimelineEvent } from './models/timeline.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'PatternFly Timeline';
  timelineData: TimelineData[] = [];
  selectedSeries: string[] = [];
  legendContent = '';

  ngOnInit() {
    this.loadSampleData();
  }

  private loadSampleData() {
    // Sample data similar to the original demo
    this.timelineData = [
      {
        name: 'Power Activity',
        data: [
          { date: new Date('2016-04-08T15:07:37.374Z'), details: { event: 'vmPowerOn', object: 'vmName' } },
          { date: new Date('2016-04-08T15:07:37.374Z'), details: { event: 'vmPowerOn', object: 'vmName' } },
          { date: new Date('2016-04-15T21:04:16.247Z'), details: { event: 'vmPowerOn', object: 'vmName' } }
        ]
      },
      {
        name: 'Alarm/Error',
        data: [
          { date: new Date('2016-04-21T01:06:19.126Z'), details: { event: 'vmPowerOn', object: 'vmName' } },
          { date: new Date('2016-04-16T13:07:15.205Z'), details: { event: 'vmPowerOff', object: 'hostName' } },
          { date: new Date('2016-04-07T22:35:41.145Z'), details: { event: 'vmPowerOff', object: 'hostName' } }
        ]
      },
      {
        name: 'Configuration',
        data: [
          { date: new Date('2016-04-10T09:30:00.000Z'), details: { event: 'configChange', object: 'serverConfig' } },
          { date: new Date('2016-04-12T14:15:30.000Z'), details: { event: 'configUpdate', object: 'networkConfig' } }
        ]
      }
    ];

    // Initialize all series as selected
    this.selectedSeries = this.timelineData.map(series => series.name);
  }

  onSeriesSelectionChange(selectedSeries: string[]) {
    this.selectedSeries = selectedSeries;
  }

  onEventClick(event: TimelineEvent | any) {
    let table = '<table class="table table-striped table-bordered">';
    
    if (event.hasOwnProperty('events')) {
      table += `<thead>This is a group of ${event.events.length} events starting on ${event.date}</thead><tbody>`;
      table += '<tr><th>Date</th><th>Event</th><th>Object</th></tr>';
      
      for (let i = 0; i < event.events.length; i++) {
        table += `<tr><td>${event.events[i].date}</td>`;
        for (let j in event.events[i].details) {
          table += `<td>${event.events[i].details[j]}</td>`;
        }
        table += '</tr>';
      }
      table += '</tbody>';
    } else {
      table += `Date: ${event.date}<br>`;
      for (let i in event.details) {
        table += `${i.charAt(0).toUpperCase() + i.slice(1)}: ${event.details[i]}<br>`;
      }
    }
    
    this.legendContent = table;
  }

  get filteredTimelineData(): TimelineData[] {
    return this.timelineData.filter(series => 
      this.selectedSeries.includes(series.name)
    );
  }
}