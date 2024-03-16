export interface historicalData {
  datetime: Date
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
}

export interface FormData {
  ticker: string
  // fromDate: string;
  endDate: string
  duration: string
  timeAggregation: string
}