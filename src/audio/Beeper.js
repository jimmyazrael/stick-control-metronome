export class Queue {
  constructor() {
    this.notes = [];
  }

  get isEmpty() {
    return this.notes.length === 0;
  }

  enqueue(note) {
    this.notes.push(note);
  }

  dequeue() {
    return this.isEmpty ? null : this.notes.shift();
  }

  peek() {
    return this.isEmpty ? null : this.notes[0];
  }

  clear() {
    this.notes.length = 0;
  }
}

export class Beeper {
  constructor(options) {
    this.audioCtx = options.audioCtx;
    this.tempo = options.tempo;
    this.beats = options.beats;
    this.subdivisions = options.subdivisions;
    this.pattern = options.pattern;
    this.queue = options.queue;
    this.interval = options.interval ?? 30;
    this.lookahead = options.lookahead ?? 0.1;
    this.stepInterval = 60 / this.tempo / this.subdivisions;
    this.clicks = Object.keys(options.clicks).reduce((acc, k) => {
      const factory = options.clicks[k];
      acc[k] = factory ? factory.build(this.audioCtx) : null;
      return acc;
    }, {});
    this.nextStepTime = null;
    this.step = null;
    this.intervalId = null;
    this.currentBar = null;
  }

  start(startBar = 0) {
    this.stop();
    this.nextStepTime = this.audioCtx.currentTime;
    this.step = 0;
    this.currentBar = startBar;
    this.scheduleBeeps();
    this.intervalId = setInterval(() => this.scheduleBeeps(), this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  scheduleBeeps() {
    const now = this.audioCtx.currentTime;

    while (this.nextStepTime < now) {
      this.advanceStep();
    }

    while (this.nextStepTime < now + this.lookahead) {
      this.scheduleBeep();
      this.advanceStep();
    }
  }

  advanceStep() {
    this.nextStepTime += this.stepInterval;
    this.step = (this.step + 1) % this.pattern.length;
    if (this.step === 0) {
      ++this.currentBar;
    }
  }

  scheduleBeep() {
    if (this.step % this.subdivisions === 0) {
      const beat = Math.trunc(this.step / this.subdivisions);
      this.queue.enqueue({
        beat,
        beats: this.beats,
        time: this.nextStepTime,
        currentBar: this.currentBar
      });
    }

    const click = this.clicks[this.pattern[this.step]];
    if (click) {
      click.generate(this.audioCtx, this.nextStepTime);
    }
  }
}
