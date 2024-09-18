// import { timeStamp } from 'console';
import { ServerRespond } from './DataStreamer';


export interface Row {
  price_stock_1: number,
  price_stock_2: number,
  ratio: number,
  timestamp: Date,
  lower_bound: number,
  upper_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]) : Row {
    const priceStock1 = (serverResponds[0].top_bid.price + serverResponds[0].top_ask.price) / 2;
    const priceStock2 = (serverResponds[1].top_bid.price + serverResponds[1].top_ask.price) / 2;
    const Ratio = priceStock1 / priceStock2;
    const alertDelta = 0.05; // 0.10;
    const lowerBound = 1.0 - alertDelta;
    const upperBound = 1.0 + alertDelta;
    // must map 1:1 to src/Graph.tsx : schema
    // current server timestamp if curr resp datetime more recent than prev
    return {
      price_stock_1: priceStock1,
      price_stock_2: priceStock2,
      ratio: Ratio,
      timestamp: (serverResponds[0].timestamp > serverResponds[1].timestamp) ?
        serverResponds[0].timestamp : serverResponds[1].timestamp,
      lower_bound: lowerBound,
      upper_bound: upperBound,
      trigger_alert: (Ratio < lowerBound || Ratio > upperBound) ? Ratio : undefined,
    };
  }
}
