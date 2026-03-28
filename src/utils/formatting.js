export function formatProgress(name, value, count, offset = null, getReady = false) {
  let s = offset === null
    ? `${name} ${value + 1} of ${count}`
    : `${name} ${value + offset + 1} (${value + 1} of ${count})`;
  if (getReady) {
    s += " (get ready!)";
  }
  return s;
}

export function formatElapsed(seconds) {
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const pad = n => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
