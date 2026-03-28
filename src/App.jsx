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

  const { playbackState, currentBeat, isLastBar, currentExercise, currentRepetition, currentBar, isPreroll, start, stop, pause, resume } = useMetronome();

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

  const handleResume = () => {
    resume();
  };

  const isPlaying = playbackState === 'playing';
  const isIdle = playbackState === 'idle';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isLastBar && isPlaying ? 'animate-flash' : 'bg-green-500 dark:bg-gray-900'
    }`}>
      {/* Progress Display - Large and Prominent */}
      {playbackState !== 'idle' && (
        <div className="bg-black/30 backdrop-blur p-6 text-white text-center">
          {isPreroll ? (
            <div>
              <div className="text-7xl font-bold mb-2">GET READY</div>
              <div className="text-4xl">Exercise {currentExercise}</div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <div className="text-sm opacity-70">EXERCISE</div>
                  <div className="text-6xl font-bold">{currentExercise}</div>
                  <div className="text-xl opacity-70">of {startExercise + exercises - 1}</div>
                </div>
                <div>
                  <div className="text-sm opacity-70">REP</div>
                  <div className="text-6xl font-bold">{currentRepetition + 1}</div>
                  <div className="text-xl opacity-70">of {repetitions}</div>
                </div>
                <div>
                  <div className="text-sm opacity-70">BAR</div>
                  <div className="text-6xl font-bold">{currentBar + 1}</div>
                  <div className="text-xl opacity-70">of {bars}</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-4">
                <div
                  className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${((currentRepetition * bars + currentBar + 1) / (repetitions * bars)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-4">
        {/* Tempo Display */}
        {playbackState === 'idle' && (
          <div className="text-center mb-6">
            <div className="text-8xl font-bold text-white">{tempo}</div>
            <div className="text-2xl text-white/70">BPM</div>
            <div className="text-lg text-white/60 mt-2">Runtime: {estimatedRuntime}</div>
          </div>
        )}

        {/* Beat Indicators */}
        <div className="flex gap-4 flex-wrap justify-center mb-8">
          {[...Array(beats)].map((_, i) => (
            <div
              key={i}
              className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-150 ${
                currentBeat === i && playbackState === 'playing'
                  ? 'bg-yellow-400 text-gray-900 scale-125 shadow-2xl ring-8 ring-yellow-300'
                  : 'bg-white/20 text-white/60 border-4 border-white/40'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Transport Controls */}
        <div className="flex gap-6 justify-center mb-8">
          {playbackState === 'idle' && (
            <button onClick={handleStart} className="w-28 h-28 rounded-full bg-white text-green-600 text-6xl shadow-2xl active:scale-95 transition">▶</button>
          )}
          {playbackState === 'playing' && (
            <>
              <button onClick={pause} className="w-24 h-24 rounded-full bg-yellow-400 text-gray-900 text-5xl shadow-2xl active:scale-95 transition">⏸</button>
              <button onClick={stop} className="w-24 h-24 rounded-full bg-red-500 text-white text-5xl shadow-2xl active:scale-95 transition">⏹</button>
            </>
          )}
          {playbackState === 'paused' && (
            <>
              <button onClick={handleResume} className="w-24 h-24 rounded-full bg-white text-green-600 text-5xl shadow-2xl active:scale-95 transition">▶</button>
              <button onClick={stop} className="w-24 h-24 rounded-full bg-red-500 text-white text-5xl shadow-2xl active:scale-95 transition">⏹</button>
            </>
          )}
        </div>
      </div>

      {/* Controls - Compact and Less Prominent */}
      <div className="bg-black/20 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-white/60">Tempo</label>
            <input type="number" min={TEMPO_MIN} max={TEMPO_MAX} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white/60">Start</label>
            <input type="number" min={START_EXERCISE_MIN} max={START_EXERCISE_MAX} value={startExercise} onChange={(e) => setStartExercise(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white/60">Exercises</label>
            <input type="number" min={EXERCISES_MIN} max={EXERCISES_MAX} value={exercises} onChange={(e) => setExercises(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white/60">Reps</label>
            <select value={repetitions} onChange={(e) => setRepetitions(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'}>
              {REPETITIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/60">Bars</label>
            <select value={bars} onChange={(e) => setBars(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'}>
              {BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/60">Beats</label>
            <input type="number" min={BEATS_MIN} max={BEATS_MAX} value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'} />
          </div>
          <div>
            <label className="text-white/60">Subs</label>
            <select value={subdivisions} onChange={(e) => setSubdivisions(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'}>
              {SUBDIVISIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/60">Preroll</label>
            <select value={prerollBars} onChange={(e) => setPrerollBars(Number(e.target.value))} className="w-full p-2 rounded text-sm" disabled={playbackState !== 'idle'}>
              {PREROLL_BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-2">
          <label className="text-white/60 text-xs">Pattern</label>
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full p-2 rounded font-mono text-sm" disabled={playbackState !== 'idle'} />
        </div>
      </div>
    </div>
  );
}

export default App;
