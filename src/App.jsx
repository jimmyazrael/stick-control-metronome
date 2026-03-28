import { useState, useEffect } from 'react';
import { useMetronome } from './hooks/useMetronome';
import { usePresets } from './hooks/usePresets';
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
  const [tempo, setTempo] = useState(() => Number(localStorage.getItem('tempo')) || DEFAULT_TEMPO);
  const [startExercise, setStartExercise] = useState(() => Number(localStorage.getItem('startExercise')) || DEFAULT_START_EXERCISE);
  const [exercises, setExercises] = useState(() => Number(localStorage.getItem('exercises')) || DEFAULT_EXERCISES);
  const [repetitions, setRepetitions] = useState(() => Number(localStorage.getItem('repetitions')) || DEFAULT_REPETITIONS);
  const [bars, setBars] = useState(() => Number(localStorage.getItem('bars')) || DEFAULT_BARS);
  const [beats, setBeats] = useState(() => Number(localStorage.getItem('beats')) || DEFAULT_BEATS);
  const [subdivisions, setSubdivisions] = useState(() => Number(localStorage.getItem('subdivisions')) || DEFAULT_SUBDIVISIONS);
  const [pattern, setPattern] = useState(() => localStorage.getItem('pattern') || makeDefaultPattern(DEFAULT_BEATS, DEFAULT_SUBDIVISIONS));
  const [prerollBars, setPrerollBars] = useState(() => Number(localStorage.getItem('prerollBars')) || DEFAULT_PREROLL_BARS);
  const [estimatedRuntime, setEstimatedRuntime] = useState('0:00');
  const [resumeFromRepetition, setResumeFromRepetition] = useState(() => localStorage.getItem('resumeFromRepetition') === 'true');
  const [showHelp, setShowHelp] = useState(null);

  const { playbackState, currentBeat, isLastBar, currentExercise, currentRepetition, currentBar, isPreroll, start, stop, pause, resume } = useMetronome();
  const { presets, savePreset, deletePreset, renamePreset, loadPreset } = usePresets();

  useEffect(() => {
    const totalBars = exercises * repetitions * bars;
    const secondsPerBar = beats * (60 / tempo);
    const totalSeconds = totalBars * secondsPerBar;
    setEstimatedRuntime(formatElapsed(totalSeconds));
  }, [tempo, exercises, repetitions, bars, beats]);

  useEffect(() => {
    setPattern(makeDefaultPattern(beats, subdivisions));
  }, [beats, subdivisions]);

  useEffect(() => {
    localStorage.setItem('tempo', tempo);
    localStorage.setItem('startExercise', startExercise);
    localStorage.setItem('exercises', exercises);
    localStorage.setItem('repetitions', repetitions);
    localStorage.setItem('bars', bars);
    localStorage.setItem('beats', beats);
    localStorage.setItem('subdivisions', subdivisions);
    localStorage.setItem('pattern', pattern);
    localStorage.setItem('prerollBars', prerollBars);
    localStorage.setItem('resumeFromRepetition', resumeFromRepetition);
  }, [tempo, startExercise, exercises, repetitions, bars, beats, subdivisions, pattern, prerollBars, resumeFromRepetition]);

  const handleStart = () => {
    start({ tempo, beats, subdivisions, pattern, startExercise, exercises, repetitions, bars, prerollBars });
  };

  const handleResume = () => {
    resume(resumeFromRepetition);
  };

  const helpTexts = {
    tempo: "Speed of the metronome in beats per minute (BPM)",
    exercises: "Total number of exercises to practice",
    reps: "Number of repetitions for each exercise",
    beats: "Number of beats per bar",
    start: "Starting exercise number",
    bars: "Number of bars per repetition",
    subs: "Subdivisions per beat (1=quarter, 2=eighth, 4=sixteenth)",
    preroll: "Number of preparation bars before each exercise",
    resumeFromRep: "When paused: resume from current repetition (checked) or exercise start (unchecked)",
    pattern: "Accent pattern: A=High, B=Medium, C=Low, D=Silent",
    presets: "Save current settings as a preset for quick access later"
  };

  const handleSavePreset = () => {
    const name = prompt("Enter preset name:");
    if (name) {
      savePreset(name, { tempo, startExercise, exercises, repetitions, bars, beats, subdivisions, pattern, prerollBars });
    }
  };

  const handleLoadPreset = (id) => {
    const preset = loadPreset(id);
    if (preset) {
      setTempo(preset.tempo);
      setStartExercise(preset.startExercise);
      setExercises(preset.exercises);
      setRepetitions(preset.repetitions);
      setBars(preset.bars);
      setBeats(preset.beats);
      setSubdivisions(preset.subdivisions);
      setPattern(preset.pattern);
      setPrerollBars(preset.prerollBars);
    }
  };

  const handleRenamePreset = (id) => {
    const newName = prompt("Enter new name:");
    if (newName) renamePreset(id, newName);
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
            <button onClick={handleStart} className="w-28 h-28 rounded-2xl bg-yellow-400 text-gray-900 shadow-xl hover:bg-yellow-300 active:scale-95 transition flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}
          {playbackState === 'playing' && (
            <>
              <button onClick={pause} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              </button>
              <button onClick={stop} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
              </button>
            </>
          )}
          {playbackState === 'paused' && (
            <>
              <button onClick={handleResume} className="w-24 h-24 rounded-2xl bg-yellow-400 text-gray-900 shadow-xl hover:bg-yellow-300 active:scale-95 transition flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button onClick={stop} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white shadow-xl hover:bg-white/30 active:scale-95 transition flex items-center justify-center border border-white/30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
              </button>
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
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Tempo</label>
                <button onClick={() => setShowHelp(showHelp === 'tempo' ? null : 'tempo')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'tempo' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.tempo}</div>}
              <input type="number" min={TEMPO_MIN} max={TEMPO_MAX} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Exercises</label>
                <button onClick={() => setShowHelp(showHelp === 'exercises' ? null : 'exercises')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'exercises' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.exercises}</div>}
              <input type="number" min={EXERCISES_MIN} max={EXERCISES_MAX} value={exercises} onChange={(e) => setExercises(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Reps</label>
                <button onClick={() => setShowHelp(showHelp === 'reps' ? null : 'reps')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'reps' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.reps}</div>}
              <select value={repetitions} onChange={(e) => setRepetitions(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {REPETITIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Beats</label>
                <button onClick={() => setShowHelp(showHelp === 'beats' ? null : 'beats')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'beats' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.beats}</div>}
              <input type="number" min={BEATS_MIN} max={BEATS_MAX} value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Start</label>
                <button onClick={() => setShowHelp(showHelp === 'start' ? null : 'start')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'start' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.start}</div>}
              <input type="number" min={START_EXERCISE_MIN} max={START_EXERCISE_MAX} value={startExercise} onChange={(e) => setStartExercise(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Bars</label>
                <button onClick={() => setShowHelp(showHelp === 'bars' ? null : 'bars')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'bars' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.bars}</div>}
              <select value={bars} onChange={(e) => setBars(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Subs</label>
                <button onClick={() => setShowHelp(showHelp === 'subs' ? null : 'subs')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'subs' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.subs}</div>}
              <select value={subdivisions} onChange={(e) => setSubdivisions(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {SUBDIVISIONS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-white/70 text-xs">Preroll</label>
                <button onClick={() => setShowHelp(showHelp === 'preroll' ? null : 'preroll')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </div>
              {showHelp === 'preroll' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.preroll}</div>}
              <select value={prerollBars} onChange={(e) => setPrerollBars(Number(e.target.value))} className="w-full bg-white/20 border border-white/30 rounded p-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                {PREROLL_BARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={resumeFromRepetition} onChange={(e) => setResumeFromRepetition(e.target.checked)} className="w-4 h-4" disabled={playbackState !== 'idle'} />
                <span className="text-white/70 text-xs">Resume from rep</span>
                <button onClick={() => setShowHelp(showHelp === 'resumeFromRep' ? null : 'resumeFromRep')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
              </label>
              {showHelp === 'resumeFromRep' && <div className="absolute bg-black/90 text-xs text-yellow-300 p-2 rounded mt-16 max-w-xs">{helpTexts.resumeFromRep}</div>}
            </div>
          </div>

          {/* Pattern */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur mb-4">
            <div className="flex items-center gap-1 mb-1">
              <label className="text-white/70 text-xs">Pattern</label>
              <button onClick={() => setShowHelp(showHelp === 'pattern' ? null : 'pattern')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
            </div>
            {showHelp === 'pattern' && <div className="text-xs text-yellow-300 mb-1">{helpTexts.pattern}</div>}
            <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'} />
          </div>

          {/* Presets */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-1 mb-2">
              <label className="text-white/70 text-xs">Presets</label>
              <button onClick={() => setShowHelp(showHelp === 'presets' ? null : 'presets')} className="text-white/50 hover:text-white/80 text-xs">ⓘ</button>
            </div>
            {showHelp === 'presets' && <div className="text-xs text-yellow-300 mb-2">{helpTexts.presets}</div>}
            <div className="flex gap-2">
              <select onChange={(e) => e.target.value && handleLoadPreset(Number(e.target.value))} className="flex-1 bg-white/20 border border-white/30 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={playbackState !== 'idle'}>
                <option value="">Select preset...</option>
                {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={handleSavePreset} className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30" disabled={playbackState !== 'idle'}>Save</button>
            </div>
            {presets.length > 0 && (
              <div className="mt-2 space-y-1">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="flex-1">{p.name}</span>
                    <button onClick={() => handleRenamePreset(p.id)} className="hover:text-yellow-400 p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => deletePreset(p.id)} className="hover:text-red-400 p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
