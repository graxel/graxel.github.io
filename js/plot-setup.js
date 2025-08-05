// plot-setup.js
export const colors = [
  '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd',
  '#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'
];

// Helper to calculate initial range: from min timestamp to max + 2h
function calculateInitialXRange(xData) {
  if (!xData.length) return null;
  const timestamps = xData.map(ts => new Date(ts));
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const maxTimePlus2h = new Date(maxTime + 2 * 60 * 60 * 1000);
  return [new Date(minTime).toISOString(), maxTimePlus2h.toISOString()];
}

export function getLayoutWithCustomXRange(xData) {
  // Calculate the initial x-axis range
  const initialRange = calculateInitialXRange(xData);

  return {
    title: 'Room Temperatures',
    xaxis: {
      // title: 'Timestamp',
      tickformat: "%b %d %H:%M",
      autorange: false,        // disable autorange to use fixed range
      range: initialRange,     // set initial custom fixed range on first plot
    },
    yaxis: {
      autorange: true,
      fixedrange: true,
      ticksuffix: ' °F'
    },
    hovermode: 'x unified',
    hoverlabel: { bgcolor: 'white' }
  };
}

export const config = { responsive: true, scrollZoom: true };

export function initPlot(xData, yDataMap) {
  const layout = getLayoutWithCustomXRange(xData);
  const traces = Object.entries(yDataMap).map(([key, yVals], idx) => ({
    x: [...xData],
    y: [...yVals],
    mode: 'lines',
    name: key,
    line: { color: colors[idx % colors.length] }
  }));
  Plotly.newPlot('plot', traces, layout, config);
}
