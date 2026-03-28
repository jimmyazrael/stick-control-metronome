import { useState, useEffect } from 'react';
import { useMetronome } from './hooks/useMetronome';
import { makeDefaultPattern } from './utils/patterns';
import { formatElapsed } from './utils/formatting';
import {
  DEFAULT_TEMPO, DEFAULT_START_EXERCISE, DEFAULT_EXERCISES, DEFAULT_REPETITIONS,
  DEFAULT_BARS, DEFAULT_BEATS, DEFAULT_SUBDIVISIONS, DEFAULT_PREROLL_BARS,
  TEMPO_MIN, TEMPO_MAX, START_EXERCISE_MIN, START_EXERCISE_MAX,
  EXERCISES_MIN, EXERCISES_MAX, REPETITIONS_OPTIONS, BARS_OPTIONS,
  BEATS_MIN, BEATS_MAX, SUBDIVISIONS_OPTIONS, PREROLL_BARS_OPTIONS
} from './utils/constants';

function App() {
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [startExercise, setStartExercise] = useState(DEFAULT_START_EXERCISE);
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [repetitions, setRepetitions] = useState(DEFAULT_REPETITIONS);
  const [bars, setBars] = useState(DEFAULT_BARS);
  const [beats, setBeats] = useState(DEFAULT_BEATS);
  const [subdivisions, setSubdivisions] = useState(DEFAULT_SUBDIVISIONS);
  const [pattern, setPattern] = useState(makeDefaultPattern(DEFAULT_BEATS, DEFAULT_SUBDIVISIONS));
  const [prerollBars, setPrerollBars] = useState(DEFAULT_PREROLL_BARS);
  const [estimatedRuntime, setEstimatedRuntime] = useState('0:00');

  const { playbackState, currentBeat, isLastBar, currentExercise, currentRepetition, currentBar, isPreroll, start, stop, pause } = useMetronome();

  useEffect(() => {
    const totalBars = exercises * repetitions * bars;
    const secondsPerBar = beats * (60 / tempo);
    const totalSeconds = totalBars * secondsPerBar;
    setEstimatedRuntime(formatElapsed(totalSeconds));
  }, [tempo, exercises, repetitions, bars, beats]);

  useEffect(() => {
    setPattern(makeDefaultPattern(beats, subdivisions));
  }, [beats, subdivisions]);

  const handleStart = () => {
    start({ tempo, beats, subdivisions, pattern, startExercise, exercises, repetitions, bars, prerollBars });
  };

  const isPlaying = playbackState === 'playing';
  const isIdle = playbackState === 'idle';

  return (
    <div className={`min-h-screen flex flex-col p-4 transition-colors duration-300 ${
      isLastBar && isPlaying ? 'animate-flash' : 'bg-green-500 dark:bg-gray-900'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Stick Control</h1>
        <div className="text-white text-sm">Runtime: {estimatedRuntime}</div>
      </div>

      {/* Progress Display */}
      {playbackState !== 'idle' && (
        <div className="bg-white/20 backdrop-blur rounded-lg p-3 mb-4 text-white text-center">
          {isPreroll ? (
            <div className="text-lg font-bold">Preroll → Exercise {currentExercise}</div>
          ) : (
            <div className="flex justify-around text-sm">
              <div><span className="font-bold">Exercise:</span> {currentExercise} of {startExercise + exercises - 1}</div>
              <div><span className="font-bold">Rep:</span> {currentRepetition + 1} of {repetitions}</div>
              <div><span className="font-bold">Bar:</span> {currentBar + 1} of {bars}</div>
            </div>
          )}
        </div>
      )}

      {/* Beat Indicators */}
      <div className="flex gap-3 flex-wrap justify-center mb-6">
        {[...Array(beats)].map((_, i) => (
          <div
            key={i}
            className={`w-24 h-24 rounded-full border-8 flex items-center justify-center text-3xl font-bold transition-all ${
              currentBeat === i && playbackState === 'playing'
                ? 'bg-white text-green-600 scale-110 shadow-2xl border-white'
                : 'border-white/60 text-white/80 bg-green-600/30'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Transport Controls */}
      <div className="flex gap-4 justify-center mb-6">
        {playbackState === 'idle' && (
          <button onClick={handleStart} className="w-24 h-24 rounded-full bg-white text-green-500 text-5xl shadow-xl">▶</button>
        )}
        {playbackState === 'playing' && (
          <>
            <button onClick={pause} className="w-20 h-20 rounded-full bg-yellow-400 text-white text-4xl shadow-xl">⏸</button>
            <button onClick={stop} className="w-20 h-20 rounded-full bg-red-500 text-white text-4xl shadow-xl">⏹</button>
          </>
        )}
        {playbackState === 'paused' && (
          <>
            <button onClick={handleStart} className="w-20 h-20 rounded-full bg-white text-green-500 text-4xl shadow-xl">▶</button>
            <button onClick={stop} className="w-20 h-20 rounded-full bg-red-500 text-white text-4xl shadow-xl">⏹</button>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-3 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white text-sm">Tempo</label>
            <input type="number" min={TEMPO_MIN} max={TEMPO_MAX} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white text-sm">Start</label>
            <input type="number" min={START_EXERCISE_MIN} max={START_EXERCISE_MAX} value={startExercise} onChange={(e) => setStartExercise(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white text-sm">Exercises</label>
            <input type="number" min={EXERCISES_MIN} max={EXERCISES_MAX} value={exercises} onChange={(e) => setExercises(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white text-sm">Reps</label>
            <select value={repetitions} onChange={(e) => setRepetitions(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'}>
              {REPETITIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white text-sm">Bars</label>
            <select value={bars} onChange={(e) => setBars(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'}>
              {BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white text-sm">Beats</label>
            <input type="number" min={BEATS_MIN} max={BEATS_MAX} value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white text-sm">Subs</label>
            <select value={subdivisions} onChange={(e) => setSubdivisions(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'}>
              {SUBDIVISIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white text-sm">Preroll</label>
            <select value={prerollBars} onChange={(e) => setPrerollBars(Number(e.target.value))} className="w-full p-2 rounded" disabled={playbackState !== 'idle'}>
              {PREROLL_BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-white text-sm">Pattern</label>
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full p-2 rounded font-mono" disabled={playbackState !== 'idle'} />
        </div>
      </div>
    </div>
  );
}

export default App;
