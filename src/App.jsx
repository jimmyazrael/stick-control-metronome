import { useState } from 'react';
import { useMetronome } from './hooks/useMetronome';
import { makeDefaultPattern } from './utils/patterns';
import { DEFAULT_TEMPO, DEFAULT_BEATS, DEFAULT_SUBDIVISIONS, TEMPO_MIN, TEMPO_MAX, BEATS_MIN, BEATS_MAX, SUBDIVISIONS_OPTIONS } from './utils/constants';

function App() {
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [beats, setBeats] = useState(DEFAULT_BEATS);
  const [subdivisions, setSubdivisions] = useState(DEFAULT_SUBDIVISIONS);
  const [showControls, setShowControls] = useState(false);
  const { playbackState, currentBeat, start, stop, pause } = useMetronome();

  const handleStart = () => {
    const pattern = makeDefaultPattern(beats, subdivisions);
    start({ tempo, beats, subdivisions, pattern });
  };

  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';
  const isIdle = playbackState === 'idle';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-white">Stick Control</h1>
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-white text-2xl p-2"
        >
          ⚙️
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        {/* Tempo Display */}
        <div className="text-center">
          <div className="text-7xl md:text-9xl font-bold text-white mb-2">{tempo}</div>
          <div className="text-xl md:text-2xl text-white/80">BPM</div>
        </div>

        {/* Beat Indicators */}
        <div className="flex gap-2 md:gap-4 flex-wrap justify-center max-w-2xl">
          {[...Array(beats)].map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center text-xl md:text-2xl font-bold transition-all ${
                currentBeat === i && isPlaying
                  ? 'bg-white text-green-500 scale-110 shadow-lg'
                  : 'border-white/50 text-white/70'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Transport Controls */}
        <div className="flex gap-4">
          {isIdle && (
            <button
              onClick={handleStart}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-green-500 text-4xl md:text-5xl shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center"
            >
              ▶
            </button>
          )}
          {isPlaying && (
            <>
              <button
                onClick={pause}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-400 text-white text-3xl md:text-4xl shadow-xl active:scale-95 transition flex items-center justify-center"
              >
                ⏸
              </button>
              <button
                onClick={stop}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 text-white text-3xl md:text-4xl shadow-xl active:scale-95 transition flex items-center justify-center"
              >
                ⏹
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button
                onClick={handleStart}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-green-500 text-3xl md:text-4xl shadow-xl active:scale-95 transition flex items-center justify-center"
              >
                ▶
              </button>
              <button
                onClick={stop}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 text-white text-3xl md:text-4xl shadow-xl active:scale-95 transition flex items-center justify-center"
              >
                ⏹
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-t-3xl shadow-2xl space-y-6 max-h-[70vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>

          {/* Tempo Slider */}
          <div className="space-y-2">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Tempo: {tempo} BPM</label>
            <input
              type="range"
              min={TEMPO_MIN}
              max={TEMPO_MAX}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={!isIdle}
            />
          </div>

          {/* Beats */}
          <div className="space-y-2">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Beats per Bar</label>
            <input
              type="number"
              min={BEATS_MIN}
              max={BEATS_MAX}
              value={beats}
              onChange={(e) => setBeats(Number(e.target.value))}
              className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg"
              disabled={!isIdle}
            />
          </div>

          {/* Subdivisions */}
          <div className="space-y-2">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Subdivisions</label>
            <select
              value={subdivisions}
              onChange={(e) => setSubdivisions(Number(e.target.value))}
              className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg"
              disabled={!isIdle}
            >
              {SUBDIVISIONS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
