import { BEEP_DURATION, OSCILLATOR_PADDING } from './constants';

export class DecayingSawtoothClick {
  constructor(frequency, volume) {
    this.frequency = frequency;
    this.volume = volume;
  }

  static Builder(frequency, volume) {
    return {
      build: () => new DecayingSawtoothClick(frequency, volume)
    };
  }

  generate(audioCtx, startTime) {
    const endTime = startTime + BEEP_DURATION;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(this.frequency, startTime);
    oscillator.start(startTime);
    oscillator.stop(endTime + OSCILLATOR_PADDING);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gain).connect(audioCtx.destination);
  }
}

export class FilteredWhiteNoiseClick {
  static buffers = {};

  constructor(buffer) {
    this.buffer = buffer;
  }

  static Builder() {
    return {
      build: (audioCtx) => {
        const buffer = FilteredWhiteNoiseClick.getBuffer(audioCtx);
        return new FilteredWhiteNoiseClick(buffer);
      }
    };
  }

  generate(audioCtx, startTime) {
    const endTime = startTime + BEEP_DURATION;

    const noise = audioCtx.createBufferSource();
    noise.buffer = this.buffer;
    noise.start(startTime);
    noise.stop(endTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2000, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(1, startTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
  }

  static getBuffer(audioCtx) {
    if (FilteredWhiteNoiseClick.buffers[audioCtx]) {
      return FilteredWhiteNoiseClick.buffers[audioCtx];
    }

    const bufferLen = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferLen, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferLen; ++i) {
      data[i] = Math.random() * 2 - 1;
    }

    FilteredWhiteNoiseClick.buffers[audioCtx] = buffer;
    return buffer;
  }
}
