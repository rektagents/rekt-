export interface Alert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface AlertsData {
  alerts: Alert[];
  lastUpdated: string;
}
