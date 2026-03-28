import { useState, useEffect, useRef } from 'react';
import { Beeper, Queue } from '../audio/Beeper';
import { DecayingSawtoothClick } from '../audio/AudioClicks';
import { HIGH, MEDIUM, LOW, SILENT, HIGH_FREQUENCY, MEDIUM_FREQUENCY, LOW_FREQUENCY, HIGH_VOLUME, MEDIUM_VOLUME, LOW_VOLUME } from '../audio/constants';
import audioContextManager from '../audio/AudioContext';

export function useMetronome() {
  const [playbackState, setPlaybackState] = useState('idle');
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isLastBar, setIsLastBar] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  const [isPreroll, setIsPreroll] = useState(false);

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
    setIsLastBar(false);
    setCurrentExercise(0);
    setCurrentRepetition(0);
    setCurrentBar(0);
    setIsPreroll(false);
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
        const { startExercise, exercises, repetitions, bars, prerollBars } = configRef.current;
        const totalPrerollBars = prerollBars || 0;
        const overallBar = note.currentBar;

        if (overallBar < totalPrerollBars) {
          setIsPreroll(true);
          setCurrentBar(overallBar);
          setIsLastBar(overallBar === totalPrerollBars - 1);
        } else {
          setIsPreroll(false);
          const barAfterPreroll = overallBar - totalPrerollBars;
          const barsPerExercise = bars * repetitions;
          const exercise = Math.floor(barAfterPreroll / barsPerExercise);
          const barInExercise = barAfterPreroll % barsPerExercise;
          const repetition = Math.floor(barInExercise / bars);
          const bar = barInExercise % bars;

          setCurrentExercise(exercise + startExercise);
          setCurrentRepetition(repetition);
          setCurrentBar(bar);

          const totalBars = exercises * repetitions * bars;
          setIsLastBar(barAfterPreroll === totalBars - 1);
        }
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

  return { playbackState, currentBeat, isLastBar, currentExercise, currentRepetition, currentBar, isPreroll, start, stop, pause };
}
