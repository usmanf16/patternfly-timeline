import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { TimelineData, TimelineConfig, TimelineDimensions, TimelineScales } from '../../models/timeline.model';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data: TimelineData[] = [];
  @Input() config: Partial<TimelineConfig> = {};
  @Output() eventClick = new EventEmitter<any>();
  @Output() eventHover = new EventEmitter<any>();
  @Output() eventZoom = new EventEmitter<any>();

  @ViewChild('timelineContainer', { static: true }) timelineContainer!: ElementRef;

  private svg: any;
  private dimensions!: TimelineDimensions;
  private scales!: TimelineScales;
  private finalConfig!: TimelineConfig;
  private zoom: any;

  constructor(
    private timelineService: TimelineService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.finalConfig = this.timelineService.getDefaultConfig();
    this.updateConfig();
  }

  ngAfterViewInit() {
    this.initializeTimeline();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateTimeline();
    }
    if (changes['config'] && !changes['config'].firstChange) {
      this.updateConfig();
      this.updateTimeline();
    }
  }

  private updateConfig() {
    this.finalConfig = { ...this.finalConfig, ...this.config };
    
    // Set up event handlers
    if (this.eventClick.observers.length > 0) {
      this.finalConfig.eventClick = (event: any) => this.eventClick.emit(event);
    }
    if (this.eventHover.observers.length > 0) {
      this.finalConfig.eventHover = (event: any) => this.eventHover.emit(event);
    }
    if (this.eventZoom.observers.length > 0) {
      this.finalConfig.eventZoom = (event: any) => this.eventZoom.emit(event);
    }
  }

  private initializeTimeline() {
    if (!this.data || this.data.length === 0) return;

    this.setupDimensions();
    this.setupScales();
    this.createSvg();
    this.drawTimeline();
  }

  private updateTimeline() {
    if (!this.svg || !this.data || this.data.length === 0) return;

    this.setupDimensions();
    this.setupScales();
    this.drawTimeline();
  }

  private setupDimensions() {
    const containerWidth = this.timelineContainer.nativeElement.clientWidth;
    const processedData = this.timelineService.groupEvents(this.data, this.finalConfig.eventGrouping || 60000);
    
    this.finalConfig.lineHeight = (processedData.length <= 3) ? 80 : 40;
    
    const height = processedData.length * this.finalConfig.lineHeight!;
    
    this.dimensions = {
      width: containerWidth - this.finalConfig.padding!.right - this.finalConfig.padding!.left - this.finalConfig.labelWidth! - (this.finalConfig.slider ? this.finalConfig.sliderWidth! : 0),
      height,
      ctxHeight: this.finalConfig.contextHeight!,
      outer_height: height + this.finalConfig.padding!.top + this.finalConfig.padding!.bottom + (this.finalConfig.context ? this.finalConfig.contextHeight! + 40 : 0)
    };
  }

  private setupScales() {
    const processedData = this.timelineService.groupEvents(this.data, this.finalConfig.eventGrouping || 60000);
    
    this.scales = {
      x: d3.time.scale()
        .range([0, this.dimensions.width])
        .domain([this.finalConfig.start!, this.finalConfig.end!]),
      y: d3.scale.ordinal()
        .domain(processedData.map(d => d.name))
        .range(processedData.map((d, i) => i * this.finalConfig.lineHeight!)),
      ctx: d3.time.scale()
        .range([0, this.dimensions.width])
        .domain([this.finalConfig.contextStart!, this.finalConfig.contextEnd!]),
      cty: d3.scale.linear().range([this.dimensions.ctxHeight, 0])
    };
  }

  private createSvg() {
    // Remove existing SVG
    d3.select(this.timelineContainer.nativeElement).select('svg').remove();

    this.svg = d3.select(this.timelineContainer.nativeElement)
      .append('svg')
      .classed('timeline-pf-chart', true)
      .attr('width', this.dimensions.width + this.finalConfig.padding!.left + this.finalConfig.padding!.right + this.finalConfig.labelWidth!)
      .attr('height', this.dimensions.outer_height);
  }

  private drawTimeline() {
    const processedData = this.timelineService.groupEvents(this.data, this.finalConfig.eventGrouping || 60000);
    
    // Clear existing content
    this.svg.selectAll('*').remove();

    // Create main groups
    const mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.finalConfig.padding!.left + this.finalConfig.labelWidth!}, ${this.finalConfig.padding!.top})`);

    // Draw grid
    this.drawGrid(mainGroup);
    
    // Draw axes
    this.drawAxes(mainGroup);
    
    // Draw labels
    this.drawLabels();
    
    // Draw events
    this.drawEvents(mainGroup, processedData);
    
    // Setup zoom
    this.setupZoom(mainGroup);
  }

  private drawGrid(container: any) {
    const gridPattern = this.svg.append('defs')
      .append('pattern')
      .attr('id', 'timeline-grid-pattern')
      .attr('width', this.dimensions.width)
      .attr('height', this.finalConfig.lineHeight! * 2)
      .attr('patternUnits', 'userSpaceOnUse');

    gridPattern.append('rect')
      .attr('width', this.dimensions.width)
      .attr('height', this.finalConfig.lineHeight!)
      .attr('fill', '#fafafa');

    gridPattern.append('line')
      .attr('x1', 0)
      .attr('x2', this.dimensions.width)
      .attr('y1', this.finalConfig.lineHeight!)
      .attr('y2', this.finalConfig.lineHeight!)
      .attr('stroke', '#d1d1d1')
      .attr('stroke-width', 1);

    container.append('rect')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height)
      .attr('fill', 'url(#timeline-grid-pattern)')
      .classed('timeline-pf-grid', true);
  }

  private drawAxes(container: any) {
    const xAxis = d3.svg.axis()
      .scale(this.scales.x)
      .orient('bottom');

    container.append('g')
      .classed('timeline-pf-x-axis', true)
      .attr('transform', `translate(0, ${this.dimensions.height})`)
      .call(xAxis);
  }

  private drawLabels() {
    const processedData = this.timelineService.groupEvents(this.data, this.finalConfig.eventGrouping || 60000);
    
    const labelsContainer = this.svg.append('g')
      .classed('timeline-pf-labels', true)
      .attr('transform', `translate(${this.finalConfig.padding!.left}, ${this.finalConfig.padding!.top})`);

    const labels = labelsContainer.selectAll('.timeline-pf-label')
      .data(processedData);

    labels.enter()
      .append('text')
      .classed('timeline-pf-label', true)
      .attr('transform', (d: any, i: number) => `translate(${this.finalConfig.labelWidth! - 20}, ${this.scales.y(d.name) + (this.finalConfig.lineHeight! / 2)})`)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .text((d: any) => {
        const count = this.timelineService.countEvents(d.data);
        return d.name + (count > 0 ? ` (${count})` : '');
      });

    labels.exit().remove();
  }

  private drawEvents(container: any, data: TimelineData[]) {
    const dropsContainer = container.append('g')
      .classed('timeline-pf-drops-container', true);

    const dropLines = dropsContainer.selectAll('.timeline-pf-drop-line')
      .data(data);

    const dropLinesEnter = dropLines.enter()
      .append('g')
      .classed('timeline-pf-drop-line', true)
      .attr('transform', (d: any, i: number) => `translate(0, ${this.scales.y(d.name) + (this.finalConfig.lineHeight! / 2)})`)
      .attr('fill', (d: any, i: number) => this.finalConfig.eventLineColor!(d, i));

    dropLines.each((dropLineData: any, i: number) => {
      const dropLine = d3.select(dropLines[0][i]);
      
      const drops = dropLine.selectAll('.timeline-pf-drop')
        .data(dropLineData.data);

      drops.enter()
        .append('text')
        .classed('timeline-pf-drop', true)
        .classed('timeline-pf-event-group', (d: any) => d.hasOwnProperty('events'))
        .attr('transform', (d: any) => `translate(${this.scales.x(d.date)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text((d: any) => this.finalConfig.eventShape!(d))
        .on('click', (d: any) => {
          if (this.finalConfig.eventClick) {
            this.finalConfig.eventClick(d);
          }
        })
        .on('mouseover', (d: any) => {
          if (this.finalConfig.eventHover) {
            this.finalConfig.eventHover(d);
          }
        });

      drops.exit().remove();
    });

    dropLines.exit().remove();
  }

  private setupZoom(container: any) {
    this.zoom = d3.behavior.zoom()
      .x(this.scales.x)
      .scaleExtent([this.finalConfig.minScale!, this.finalConfig.maxScale!])
      .on('zoom', () => {
        this.redrawEvents();
        if (this.finalConfig.eventZoom) {
          this.finalConfig.eventZoom(d3.event);
        }
      });

    container.call(this.zoom);
  }

  private redrawEvents() {
    const processedData = this.timelineService.groupEvents(this.data, this.finalConfig.eventGrouping || 60000);
    
    this.svg.selectAll('.timeline-pf-drop')
      .attr('transform', (d: any) => `translate(${this.scales.x(d.date)})`);

    // Redraw x-axis
    const xAxis = d3.svg.axis()
      .scale(this.scales.x)
      .orient('bottom');

    this.svg.select('.timeline-pf-x-axis')
      .call(xAxis);
  }
}