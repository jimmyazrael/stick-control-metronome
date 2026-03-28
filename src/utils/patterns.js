import { HIGH, MEDIUM, LOW, SILENT } from '../audio/constants';

export function makeDefaultPattern(beats, subdivisions) {
  let pattern = "";
  for (let i = 0; i < beats; ++i) {
    pattern += i === 0 ? HIGH : MEDIUM;
    for (let j = 0; j < subdivisions - 1; ++j) {
      pattern += LOW;
    }
  }
  return pattern;
}

export function parsePattern(s, beats, subdivisions) {
  const len = beats * subdivisions;
  return (s ?? "").substring(0, len).padEnd(len, SILENT);
}

export function parseNumber(s, min, max, defaultValue) {
  if (s === null || s === undefined) return defaultValue;
  const value = parseInt(s, 10);
  if (Number.isNaN(value)) return defaultValue;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function parseOneOf(s, options, defaultValue) {
  if (s === null || s === undefined) return defaultValue;
  const value = parseInt(s, 10);
  if (Number.isNaN(value)) return defaultValue;
  return options.includes(value) ? value : defaultValue;
}

export function parseBool(s) {
  return s === "true";
}
