export interface HistoricalData {
  datetime: Date|string
  tzname: string
  ticker: string
  open: number
  high: number
  low: number
  close: number
  diff: number
  volume: number
  wap: number
  count: number
  signal: string
  rsi: number
  // [key: string]: string | number | Date
}

export interface UserFormData {
  ticker: string
  // fromDate: string;
  endDate: string
  duration: number
  timeAggregation: string
  [key: string]: string|number
}