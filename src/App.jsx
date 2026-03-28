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
  const [resumeFromRepetition, setResumeFromRepetition] = useState(true);

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
    resume(resumeFromRepetition);
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

        {/* Beat Indicators - Full Width Responsive */}
        <div className="grid gap-4 mb-8 px-4" style={{ gridTemplateColumns: `repeat(${beats}, 1fr)` }}>
          {[...Array(beats)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-150 ${
                currentBeat === i && playbackState === 'playing'
                  ? 'bg-yellow-400 text-gray-900 scale-110 shadow-2xl ring-4 ring-yellow-300'
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
            <button onClick={handleStart} className="w-28 h-28 rounded-2xl bg-yellow-400 text-gray-900 text-6xl shadow-xl hover:bg-yellow-300 active:scale-95 transition flex items-center justify-center">▶</button>
          )}
          {playbackState === 'playing' && (
            <>
              <button onClick={pause} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white text-5xl shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">⏸</button>
              <button onClick={stop} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white text-5xl shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">⏹</button>
            </>
          )}
          {playbackState === 'paused' && (
            <>
              <button onClick={handleResume} className="w-24 h-24 rounded-2xl bg-yellow-400 text-gray-900 text-5xl shadow-xl hover:bg-yellow-300 active:scale-95 transition flex items-center justify-center">▶</button>
              <button onClick={stop} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white text-5xl shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">⏹</button>
            </>
          )}
        </div>
      </div>

      {/* Controls - Modern Design */}
      <div className="bg-black/20 backdrop-blur border-t border-white/10">
        <div className="max-w-6xl mx-auto p-6">
          {/* Main Controls */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Tempo</label>
              <input type="number" min={TEMPO_MIN} max={TEMPO_MAX} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Exercises</label>
              <input type="number" min={EXERCISES_MIN} max={EXERCISES_MAX} value={exercises} onChange={(e) => setExercises(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Reps</label>
              <select value={repetitions} onChange={(e) => setRepetitions(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {REPETITIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Beats</label>
              <input type="number" min={BEATS_MIN} max={BEATS_MAX} value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Start</label>
              <input type="number" min={START_EXERCISE_MIN} max={START_EXERCISE_MAX} value={startExercise} onChange={(e) => setStartExercise(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Bars</label>
              <select value={bars} onChange={(e) => setBars(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Subs</label>
              <select value={subdivisions} onChange={(e) => setSubdivisions(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {SUBDIVISIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <label className="text-white/70 text-xs block mb-1">Preroll</label>
              <select value={prerollBars} onChange={(e) => setPrerollBars(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {PREROLL_BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={resumeFromRepetition} onChange={(e) => setResumeFromRepetition(e.target.checked)} className="w-4 h-4" disabled={playbackState !== 'idle'} />
                <span className="text-white/70 text-xs">Resume from rep</span>
              </label>
            </div>
          </div>

          {/* Pattern */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <label className="text-white/70 text-xs block mb-1">Pattern</label>
            <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
