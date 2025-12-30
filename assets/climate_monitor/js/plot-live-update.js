// plot-live-update.js
import { colors } from './plot-setup.js';
import { updateLastUpdatedBoxes, startRealtimeTimers } from './ui-utils.js';

let timersStarted = false;

export function handleWebSocketMessage({ msg, xData, yDataMap, lastUpdatedContainer }) {
  if (!msg.timestamp || !msg.sensor_data) return;

  xData.push(msg.timestamp);

  let keys = Object.keys(yDataMap);
  const newTraces = [];

  Object.keys(msg.sensor_data).forEach(key => {
    if (key.endsWith('_temp')) {
      if (!(key in yDataMap)) {
        yDataMap[key] = [];
        newTraces.push(key);
      }
      yDataMap[key].push(msg.sensor_data[key]);
    }
  });

  if (newTraces.length > 0) {
    const tracesToAdd = newTraces.map((key, idx) => ({
      x: [...xData],
      y: [...yDataMap[key]],
      mode: 'lines',
      name: key,
      line: { color: colors[(keys.length + idx) % colors.length] }
    }));
    Plotly.addTraces('plot', tracesToAdd);
    keys = Object.keys(yDataMap);
  }

  const updateX = [];
  const updateY = [];
  keys.forEach(key => {
    updateX.push([msg.timestamp]);
    updateY.push([yDataMap[key][yDataMap[key].length - 1]]);
  });

  Plotly.extendTraces('plot', { x: updateX, y: updateY }, keys.map((_, i) => i));

  if (msg.update_times) {
    updateLastUpdatedBoxes(msg.update_times, lastUpdatedContainer);
    if (!timersStarted) {
      startRealtimeTimers(lastUpdatedContainer);
      timersStarted = true;
    }
  }
}
