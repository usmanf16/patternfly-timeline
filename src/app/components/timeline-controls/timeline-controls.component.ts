import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TimelineData } from '../../models/timeline.model';

declare var $: any;

@Component({
  selector: 'app-timeline-controls',
  templateUrl: './timeline-controls.component.html',
  styleUrls: ['./timeline-controls.component.scss']
})
export class TimelineControlsComponent implements OnInit {
  @Input() timelineData: TimelineData[] = [];
  @Input() selectedSeries: string[] = [];
  @Output() seriesSelectionChange = new EventEmitter<string[]>();
  @Output() dateRangeChange = new EventEmitter<{start: Date, end: Date}>();
  @Output() resetZoom = new EventEmitter<void>();

  selectedRange = '1 week';
  selectedPosition = 'ending';
  selectedDate = new Date();

  ngOnInit() {
    setTimeout(() => {
      this.initializeControls();
    }, 100);
  }

  private initializeControls() {
    // Initialize bootstrap select if available
    if (typeof $ !== 'undefined' && $.fn.selectpicker) {
      $('#timeline-selectpicker').selectpicker('refresh');
    }

    // Initialize datepicker if available
    if (typeof $ !== 'undefined' && $.fn.datepicker) {
      $('#datepicker').datepicker({
        autoclose: true,
        todayBtn: "linked",
        todayHighlight: true
      });
      $('#datepicker').datepicker('setDate', this.selectedDate);
    }
  }

  onSeriesChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option: any) => option.value);
    this.seriesSelectionChange.emit(selectedOptions);
  }

  onRangeChange(range: string) {
    this.selectedRange = range;
    this.applyDateFilter();
  }

  onPositionChange(position: string) {
    this.selectedPosition = position;
    this.applyDateFilter();
  }

  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.applyDateFilter();
  }

  onResetZoom() {
    this.resetZoom.emit();
  }

  private applyDateFilter() {
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_DAY = 24 * ONE_HOUR;
    const ONE_WEEK = 7 * ONE_DAY;
    const ONE_MONTH = 30 * ONE_DAY;

    let range: number;
    switch (this.selectedRange) {
      case '1 hour':
        range = ONE_HOUR;
        break;
      case '1 day':
        range = ONE_DAY;
        break;
      case '1 week':
        range = ONE_WEEK;
        break;
      case '1 month':
        range = ONE_MONTH;
        break;
      default:
        range = ONE_WEEK;
    }

    let startDate: Date;
    let endDate: Date;

    switch (this.selectedPosition) {
      case 'centered on':
        startDate = new Date(this.selectedDate.getTime() - range / 2);
        endDate = new Date(this.selectedDate.getTime() + range / 2);
        break;
      case 'starting':
        startDate = this.selectedDate;
        endDate = new Date(this.selectedDate.getTime() + range);
        break;
      case 'ending':
        startDate = new Date(this.selectedDate.getTime() - range);
        endDate = this.selectedDate;
        break;
      default:
        startDate = new Date(this.selectedDate.getTime() - range);
        endDate = this.selectedDate;
    }

    this.dateRangeChange.emit({ start: startDate, end: endDate });
  }
}