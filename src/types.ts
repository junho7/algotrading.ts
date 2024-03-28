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
  macd: MACDData
  // [key: string]: string | number | Date
}

export interface MACDData {
  macdLine: number;
  signalLine: number;
  histogram: number;
  [key: string]: number;
}
export interface UserFormData {
  ticker: string
  // fromDate: string;
  endDate: string
  duration: number
  timeAggregation: string
  [key: string]: string|number
}