import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_stock_1: 'float',
      price_stock_2: 'float',
      ratio: 'float', // 1.0 ratio is perfect correlation - no alpha
      timestamp: 'date',
      lower_bound: 'float', // fixed line at 1.0 - thresh
      upper_bound: 'float', // fixed line at 1.0 + thresh
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      // don't need column-pivots as we are plotting ratio
      // not stock1 and stock2 for each timestamp
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      // aggregates fix duplicate data
      elem.setAttribute('aggregates', JSON.stringify({
        price_stock_1: 'avg',
        price_stock_2: 'avg',
        ratio: 'avg',
        timestamp: 'distinct_count',
        lower_bound: 'avg',
        upper_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  // Errors to fix in the future
  //
  // add a pause / stop streaming data button
  //
  // make alert only red if above/below a threshold
  // now it stays red until it crosses opposite threshold
  //
  // if below lower_bound,
  // flash 'buy stock 1', 'short stock 2'
  //
  // if above upper_bound,
  // flash 'short stock 1', 'buy stock 2'

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
