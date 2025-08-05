// ui-utils.js

console.log("ui-utils.js loaded");

// Format elapsed time between a past timestamp and now as a human-readable string
export function formatElapsedTime(ts) {
  if (!ts) return "-";
  const past = (ts instanceof Date) ? ts : new Date(ts);
  if (isNaN(past)) return "-";

  const now = new Date();
  const diffMs = now - past; // difference in milliseconds
  if (diffMs < 0) return "0s"; // future? treat as zero

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Create/update last-updated boxes with realtime timers using a data attribute to store timestamp
export function updateLastUpdatedBoxes(updateTimes, lastUpdatedContainer) {
  lastUpdatedContainer.innerHTML = '';
  if (!updateTimes) return;

  Object.entries(updateTimes).forEach(([tableName, sensors]) => {
    Object.entries(sensors).forEach(([sensorId, lastUpdated]) => {
      const box = document.createElement('div');
      box.style = `
        border:1px solid #ddd;
        border-radius:4px;
        padding:0.5em 1em;
        min-width:130px;
        background:#f9f9f9;
        box-shadow:1px 1px 4px rgba(0,0,0,0.1);
        font-size:0.9em;
        text-align:center;
      `;

      const label = document.createElement('div');
      label.textContent = `${tableName}: ${sensorId}`;
      label.style = 'font-weight:600;margin-bottom:0.3em;';

      // The timer div will show elapsed time like "5s ago"
      const timerDiv = document.createElement('div');
      timerDiv.dataset.timestamp = new Date(lastUpdated).toISOString(); // store timestamp ISO string as attribute
      timerDiv.textContent = formatElapsedTime(lastUpdated); // initial formatting

      box.appendChild(label);
      box.appendChild(timerDiv);
      lastUpdatedContainer.appendChild(box);
    });
  });
}

// Call this once to start interval and update all timer divs inside lastUpdatedContainer every second
export function startRealtimeTimers(lastUpdatedContainer) {
  if (!lastUpdatedContainer) return;

  setInterval(() => {
    const timerDivs = lastUpdatedContainer.querySelectorAll('div[data-timestamp]');
    timerDivs.forEach(div => {
      const ts = div.dataset.timestamp;
      div.textContent = formatElapsedTime(ts);
    });
  }, 1000);
}
