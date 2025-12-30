// main.js

const FLASK_API_URL = "https://data.kevingrazel.com/api/initial_data";
const WEBSOCKET_URL = "wss://data.kevingrazel.com/ws/";

import { initPlot } from './plot-setup.js';
import { handleWebSocketMessage } from './plot-live-update.js';

const wsStatus = document.getElementById('ws-status');
const lastUpdatedContainer = document.getElementById('last-updated-container');
let xData = [];
let yDataMap = {};

fetch(FLASK_API_URL)
  .then(r => r.json())
  .then(data => {
    if (!data.obs_time || !data.sensor_data) {
      wsStatus.textContent = "Initial data: Missing expected fields";
      return;
    }
    xData = data.obs_time;
    yDataMap = {};
    Object.keys(data.sensor_data).forEach(key => {
      if (key.endsWith('_temp')) yDataMap[key] = data.sensor_data[key];
    });
    initPlot(xData, yDataMap);
    wsStatus.textContent = "Plotted initial data, connecting to WebSocket...";
    startWebSocket();
  })
  .catch(e => {
    wsStatus.textContent = "Failed to load initial data: " + e;
  });

function startWebSocket() {
  let ws;
  try {
    ws = new WebSocket(WEBSOCKET_URL);
  } catch (err) {
    wsStatus.textContent = "WebSocket error: " + err;
    return;
  }
  ws.onopen = () => wsStatus.textContent = "🟢 WebSocket connected";
  ws.onclose = () => wsStatus.textContent = "🔴 WebSocket disconnected";
  ws.onerror = () => wsStatus.textContent = "⚠️ WebSocket error";
  ws.onmessage = evt => {
    let msg;
    try { msg = JSON.parse(evt.data); } catch { return; }
    handleWebSocketMessage({
      msg, xData, yDataMap, lastUpdatedContainer
    });
  };
}
