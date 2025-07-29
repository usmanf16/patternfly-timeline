import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { TimelineData, TimelineConfig, TimelineEvent, TimelineEventGroup } from '../models/timeline.model';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  getDefaultConfig(): TimelineConfig {
    return {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      end: new Date(),
      contextStart: null,
      contextEnd: null,
      minScale: 0,
      maxScale: Infinity,
      width: null,
      padding: {
        top: 30,
        left: 40,
        bottom: 40,
        right: 40
      },
      lineHeight: 40,
      labelWidth: 140,
      sliderWidth: 30,
      contextHeight: 50,
      locale: null,
      axisFormat: null,
      tickFormat: [
        ['.%L', (d: Date) => d.getMilliseconds()],
        [':%S', (d: Date) => d.getSeconds()],
        ['%I:%M', (d: Date) => d.getMinutes()],
        ['%I %p', (d: Date) => d.getHours()],
        ['%b %d', (d: Date) => d.getMonth() && d.getDate()],
        ['%b', (d: Date) => d.getMonth()],
        ['%Y', () => true]
      ],
      eventHover: null,
      eventZoom: null,
      eventClick: null,
      eventLineColor: (d: any, i: number) => {
        switch (i % 5) {
          case 0: return "#00659c";
          case 1: return "#0088ce";
          case 2: return "#3f9c35";
          case 3: return "#ec7a08";
          case 4: return "#cc0000";
          default: return "#00659c";
        }
      },
      eventColor: null,
      eventShape: (d: any) => {
        if (d.hasOwnProperty("events")) {
          return '\uf140'; // FontAwesome group icon
        } else {
          return '\uf111'; // FontAwesome circle icon
        }
      },
      eventPopover: (d: any) => {
        let popover = '';
        if (d.hasOwnProperty("events")) {
          popover = `Group of ${d.events.length} events`;
        } else {
          for (let i in d.details) {
            popover += i.charAt(0).toUpperCase() + i.slice(1) + ': ' + d.details[i] + '<br>';
          }
          popover += 'Date: ' + d.date;
        }
        return popover;
      },
      marker: true,
      context: true,
      slider: true,
      eventGrouping: 60000, // one minute
      dateFormat: d3.time.format('%a %x %I:%M %p')
    };
  }

  groupEvents(data: TimelineData[], toRoundTo: number): TimelineData[] {
    const toReturn: TimelineData[] = [];

    for (let i = 0; i < data.length; i++) {
      toReturn[i] = {
        name: data[i].name,
        data: []
      };

      const temp: { [key: number]: TimelineEvent[] } = {};

      for (let j = 0; j < data[i].data.length; j++) {
        const event = data[i].data[j] as TimelineEvent;
        const rounded = Math.round(event.date.getTime() / toRoundTo) * toRoundTo;
        
        if (temp[rounded] === undefined) {
          temp[rounded] = [];
        }
        temp[rounded].push(event);
      }

      for (let k in temp) {
        if (temp[k].length === 1) {
          toReturn[i].data.push(temp[k][0]);
        } else {
          const tempDate = new Date();
          tempDate.setTime(+k);
          const eventGroup: TimelineEventGroup = {
            date: tempDate,
            events: temp[k]
          };
          toReturn[i].data.push(eventGroup);
        }
      }
    }

    return toReturn;
  }

  countEvents(data: (TimelineEvent | TimelineEventGroup)[]): number {
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].hasOwnProperty('events')) {
        count += (data[i] as TimelineEventGroup).events.length;
      } else {
        count++;
      }
    }
    return count;
  }

  getDates(data: TimelineData[]): Date[] {
    const toReturn: Date[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].data.length; j++) {
        toReturn.push(data[i].data[j].date);
      }
    }
    return toReturn;
  }

  filterDataByDateRange(data: TimelineData[], start: Date, end: Date): TimelineData[] {
    return data.map(series => ({
      ...series,
      data: series.data.filter(event => 
        event.date >= start && event.date <= end
      )
    }));
  }
}