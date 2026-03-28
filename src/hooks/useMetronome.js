import { useState, useEffect, useRef } from 'react';
import { Beeper, Queue } from '../audio/Beeper';
import { DecayingSawtoothClick } from '../audio/AudioClicks';
import { HIGH, MEDIUM, LOW, SILENT, HIGH_FREQUENCY, MEDIUM_FREQUENCY, LOW_FREQUENCY, HIGH_VOLUME, MEDIUM_VOLUME, LOW_VOLUME } from '../audio/constants';
import audioContextManager from '../audio/AudioContext';

export function useMetronome() {
  const [playbackState, setPlaybackState] = useState('idle');
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isLastBar, setIsLastBar] = useState(false);

  const beeperRef = useRef(null);
  const queueRef = useRef(new Queue());
  const animationFrameRef = useRef(null);
  const configRef = useRef(null);

  const start = (config) => {
    configRef.current = config;
    const audioCtx = audioContextManager.getContext();

    const clicks = {
      [HIGH]: DecayingSawtoothClick.Builder(HIGH_FREQUENCY, HIGH_VOLUME),
      [MEDIUM]: DecayingSawtoothClick.Builder(MEDIUM_FREQUENCY, MEDIUM_VOLUME),
      [LOW]: DecayingSawtoothClick.Builder(LOW_FREQUENCY, LOW_VOLUME),
      [SILENT]: null
    };

    beeperRef.current = new Beeper({
      audioCtx,
      tempo: config.tempo,
      beats: config.beats,
      subdivisions: config.subdivisions,
      pattern: config.pattern,
      queue: queueRef.current,
      clicks
    });

    beeperRef.current.start();
    setPlaybackState('playing');
    updateProgress();
  };

  const stop = () => {
    if (beeperRef.current) {
      beeperRef.current.stop();
      beeperRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    queueRef.current.clear();
    setPlaybackState('idle');
    setCurrentBeat(0);
  };

  const pause = () => {
    if (beeperRef.current) {
      beeperRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setPlaybackState('paused');
  };

  const updateProgress = () => {
    const note = queueRef.current.peek();
    if (note && audioContextManager.getContext().currentTime >= note.time) {
      queueRef.current.dequeue();
      setCurrentBeat(note.beat);

      if (configRef.current) {
        const { exercises, repetitions, bars } = configRef.current;
        const totalBars = exercises * repetitions * bars;
        const isLast = note.currentBar === totalBars - 1;
        setIsLastBar(isLast);
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    return () => {
      if (beeperRef.current) beeperRef.current.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { playbackState, currentBeat, isLastBar, start, stop, pause };
}
