export enum Actions {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Trade {
  date: string;
  symbol: string;
  name: string;
  client: string;
  action: Actions;
  quantity: number;
  price: number;
  remarks: string;
}
