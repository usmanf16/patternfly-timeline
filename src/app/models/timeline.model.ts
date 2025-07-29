export interface TimelineEvent {
  date: Date;
  details: { [key: string]: any };
}

export interface TimelineEventGroup {
  date: Date;
  events: TimelineEvent[];
}

export interface TimelineData {
  name: string;
  data: (TimelineEvent | TimelineEventGroup)[];
}

export interface TimelineConfig {
  start?: Date;
  end?: Date;
  contextStart?: Date;
  contextEnd?: Date;
  minScale?: number;
  maxScale?: number;
  width?: number;
  padding?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  lineHeight?: number;
  labelWidth?: number;
  sliderWidth?: number;
  contextHeight?: number;
  locale?: any;
  axisFormat?: any;
  tickFormat?: any[];
  eventHover?: (event: any) => void;
  eventZoom?: (event: any) => void;
  eventClick?: (event: any) => void;
  eventLineColor?: (d: any, i: number) => string;
  eventColor?: string | ((d: any, i: number) => string);
  eventShape?: (d: any) => string;
  eventPopover?: (d: any) => string;
  marker?: boolean;
  context?: boolean;
  slider?: boolean;
  eventGrouping?: number;
  dateFormat?: (date: Date) => string;
}

export interface TimelineDimensions {
  width: number;
  height: number;
  ctxHeight: number;
  outer_height: number;
}

export interface TimelineScales {
  x: any;
  y: any;
  ctx: any;
  cty: any;
}