export interface Holding {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

export interface PortfolioData {
  holdings: Holding[];
  lastUpdated: string;
}
